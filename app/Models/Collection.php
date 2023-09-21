<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\StrippedHtml;
use App\Enums\CurrencyCode;
use App\Models\Traits\BelongsToNetwork;
use App\Models\Traits\Reportable;
use App\Notifications\CollectionReport;
use App\Support\BlacklistedCollections;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Query\Expression;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\SchemalessAttributes\Casts\SchemalessAttributes;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

/**
 * @property ?int $supply
 * @property ?string $floor_price
 * @property ?string $last_indexed_token_number.
 */
class Collection extends Model
{
    use BelongsToNetwork, HasFactory, HasSlug, Reportable, SoftDeletes;

    const TWITTER_URL = 'https://x.com/';

    const DISCORD_URL = 'https://discord.gg/';

    /**
     * @var array<string>
     */
    protected $guarded = ['id'];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'description' => StrippedHtml::class,
        'floor_price_retrieved_at' => 'datetime',
        'extra_attributes' => SchemalessAttributes::class,
        'fiat_value' => 'json',
        'minted_block' => 'int',
        'minted_at' => 'datetime',
        'last_viewed_at' => 'datetime',
    ];

    /**
     * @return HasOne<Token>
     */
    public function floorPriceToken(): HasOne
    {
        return $this->hasOne(Token::class, 'id', 'floor_price_token_id');
    }

    /**
     * Get the options for generating the slug.
     */
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }

    /**
     * @return HasMany<Nft>
     */
    public function nfts(): HasMany
    {
        return $this->hasMany(Nft::class);
    }

    /**
     * @return HasMany<CollectionTrait>
     */
    public function traits(): HasMany
    {
        return $this->hasMany(CollectionTrait::class);
    }

    /**
     * @return Builder<Gallery>
     */
    public function galleries(): Builder
    {
        return Gallery::query()
            ->whereHas('nfts', function (Builder $query) {
                $query->where('collection_id', $this->id);
            });
    }

    public function image(): ?string
    {
        return $this->extra_attributes->get('image');
    }

    public function banner(): ?string
    {
        return $this->extra_attributes->get('banner');
    }

    public function bannerUpdatedAt(): ?string
    {
        return $this->extra_attributes->get('banner_updated_at');
    }

    public function website(bool $defaultToExplorer = true): ?string
    {
        $website = $this->extra_attributes->get('website');

        if ($website === null) {
            return $defaultToExplorer ? $this->explorerUrl() : null;
        }

        if (Str::startsWith($website, $this->network->explorer_url) && ! $defaultToExplorer) {
            return null;
        }

        return Str::startsWith($website, ['https://', 'http://'])
                ? $website
                : Str::start($website, 'https://');
    }

    private function explorerUrl(): string
    {
        return $this->network->explorer_url.'/token/'.$this->address;
    }

    public function twitter(): ?string
    {
        $twitter = $this->extra_attributes->get('socials.twitter');
        if (! $twitter) {
            return null;
        }

        return self::TWITTER_URL.$twitter;
    }

    public function discord(): ?string
    {
        $discord = $this->extra_attributes->get('socials.discord');
        if (! $discord) {
            return null;
        }

        return self::DISCORD_URL.$discord;
    }

    public function newReportNotification(Report $report): Notification
    {
        return new CollectionReport($report);
    }

    protected function reportingThrottleDuration(): int
    {
        return config('dashbrd.reports.throttle.collection.same_collection_per_hours');
    }

    public function fiatValue(CurrencyCode $currency): ?float
    {
        return Arr::get($this->fiat_value, $currency->value);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOrderByValue(Builder $query, Wallet $wallet, string $direction, CurrencyCode $currency = CurrencyCode::USD): Builder
    {
        $nullsPosition = strtolower($direction) === 'asc' ? 'NULLS FIRST' : 'NULLS LAST';

        return $query->selectRaw(
            sprintf('collections.*, (CAST(collections.fiat_value->>\'%s\' AS float)::float * MAX(nfts.nfts_count)::float) as total_value', $currency->value)
        )
            ->leftJoin(DB::raw("(
                SELECT
                    collection_id,
                    count(*) as nfts_count
                FROM nfts
                WHERE nfts.wallet_id = $wallet->id
                GROUP BY collection_id
            ) nfts"), 'collections.id', '=', 'nfts.collection_id')
            ->groupBy('collections.id')
            ->orderByRaw("total_value {$direction} {$nullsPosition}")
            ->orderBy('collections.id', $direction);
    }

    /**
     * @param  Builder<self>  $query
     * @param  'asc'|'desc'  $direction
     * @return Builder<self>
     */
    public function scopeOrderByFloorPrice(Builder $query, string $direction, CurrencyCode $currency = CurrencyCode::USD): Builder
    {
        $nullsPosition = $direction === 'asc' ? 'NULLS FIRST' : 'NULLS LAST';

        return $query->selectRaw(
            sprintf('collections.*, CAST(collections.fiat_value->>\'%s\' AS float) as total_floor_price', $currency->value)
        )->orderByRaw("total_floor_price {$direction} {$nullsPosition}");
    }

    /**
     * @param  Builder<self>  $query
     * @param  'asc'|'desc'  $direction
     * @return Builder<self>
     */
    public function scopeOrderByMintDate(Builder $query, string $direction): Builder
    {
        if ($direction === 'asc') {
            return $query->orderByRaw('minted_at ASC NULLS FIRST');
        }

        return $query->orderByRaw('minted_at DESC NULLS LAST');
    }

    /**
     * @param  Builder<self>  $query
     * @param  'asc'|'desc'  $direction
     * @return Builder<self>
     */
    public function scopeOrderByReceivedDate(Builder $query, Wallet $wallet, string $direction): Builder
    {
        // Get the latest timestamp for each NFT
        $subselect = sprintf("SELECT timestamp
            FROM nft_activity
            WHERE nft_activity.nft_id = nfts.id AND lower(recipient) = '%s'
            -- Latest timestamp
            ORDER BY timestamp desc
            LIMIT 1", strtolower($wallet->address));

        $select = sprintf('SELECT (%s) as timestamp
            FROM nfts
            WHERE nfts.collection_id = collections.id
            -- Return the latest timestamp for each NFT
            ORDER BY timestamp desc
            LIMIT 1
        ', $subselect);

        if ($direction === 'asc') {
            return $query->orderByRaw(sprintf('(%s) ASC NULLS FIRST', $select));
        }

        return $query->orderByRaw(sprintf('(%s) DESC NULLS LAST', $select));
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOrderByChainId(Builder $query, string $direction): Builder
    {
        /** @var Expression */
        $select = Network::select('chain_id')
            ->whereColumn('networks.id', 'collections.network_id')
            ->latest('chain_id')
            ->take(1);

        return $query->orderBy($select, $direction);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeSearch(Builder $query, User $user, ?string $searchQuery): Builder
    {
        if ($searchQuery === null || $searchQuery === '') {
            return $query;
        }

        return $query->where(function (Builder $query) use ($searchQuery, $user) {
            return $query
                ->where('collections.name', 'ilike', sprintf('%%%s%%', $searchQuery))
                ->orWhereHas('nfts', function (Builder $query) use ($searchQuery, $user) {
                    $query
                        ->where(function ($query) use ($searchQuery) {
                            // Concat name + token_number to search for "name #token_number" or "name token_number"
                            $query
                                ->whereRaw("concat(nfts.name, ' #', nfts.token_number) ilike ?", [sprintf('%%%s%%', $searchQuery)])
                                ->orWhereRaw("concat(nfts.name, ' ', nfts.token_number) ilike ?", [sprintf('%%%s%%', $searchQuery)]);
                        })
                        ->whereHas('wallet', function (Builder $query) use ($user) {
                            $query->where('user_id', $user->id);
                        });
                });
        });
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeWithUserNftsCount(Builder $query, User $user): Builder
    {
        return $query->withCount([
            'nfts' => function ($query) use ($user) {
                $query->whereIn('wallet_id', $user->wallets()->select('id'));
            },
        ]);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeWithoutSpamContracts(Builder $query): Builder
    {
        return $query->leftJoin('spam_contracts', function ($join) {
            $join->on('collections.network_id', '=', 'spam_contracts.network_id')
                ->on('collections.address', '=', 'spam_contracts.address');
        })->whereNull('spam_contracts.address');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeWithAcceptableSupply(Builder $query): Builder
    {
        return $query
            ->where('collections.supply', '<=', config('dashbrd.collections_max_cap'))
            ->whereNotNull('collections.supply');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeForCollectionData(Builder $query, User $user = null): Builder
    {
        $extraAttributeSelect = "CASE
            WHEN collections.extra_attributes->>'%s' = 'null' THEN NULL
            ELSE collections.extra_attributes->>'%s'
        END";

        $currency = $user ? $user->currency()->value : CurrencyCode::USD->value;

        $query = $query->select([
            'collections.id',
            'collections.name',
            'collections.slug',
            'collections.address',
            'networks.chain_id',
            'collections.floor_price',
            DB::raw("(fiat_value->'{$currency}')::numeric as floor_price_fiat"),
            DB::raw('lower(tokens.symbol) as floor_price_currency'),
            DB::raw('tokens.decimals as floor_price_decimals'),
            DB::raw(sprintf($extraAttributeSelect, 'image', 'image').' as image'),
            DB::raw(sprintf($extraAttributeSelect, 'banner', 'banner').' as banner'),
            // gets the website url with the same logic used on the `website` method
            DB::raw(sprintf('COALESCE(%s, CONCAT(networks.explorer_url, \'%s\', collections.address)) as website', sprintf($extraAttributeSelect, 'website', 'website'), '/token/')),
            DB::raw('COUNT(collection_nfts.id) as nfts_count'),
        ])->join(
            'networks',
            'networks.id',
            '=',
            'collections.network_id'
        )
            ->leftJoin(
                'tokens',
                'tokens.id',
                '=',
                'collections.floor_price_token_id'
            )
            ->leftJoin(
                'nfts as collection_nfts',
                'collection_nfts.collection_id',
                '=',
                'collections.id'
            );

        if ($user !== null) {
            $query->leftJoin(
                'wallets as nft_wallets',
                'nft_wallets.id',
                '=',
                'collection_nfts.wallet_id'
            )
                ->where('nft_wallets.user_id', $user->id);
        }

        return $query->groupBy(
            'collections.id',
            'networks.id',
            'tokens.id'
        );
    }

    /**
     * @param  array<int>  $collectionIds
     */
    public static function updateFiatValue(array $collectionIds = []): void
    {
        $calculateFiatValueQuery = get_query('collections.calculate_fiat_value');

        $collectionIds = implode(',', $collectionIds);

        Collection::query()
            ->when(! empty($collectionIds), function ($query) use ($collectionIds) {
                $query->whereRaw("collections.id IN (SELECT collections.id FROM collections WHERE collections.id IN ({$collectionIds}) FOR UPDATE SKIP LOCKED)");
            })
            ->update(['fiat_value' => DB::raw($calculateFiatValueQuery)]);
    }

    /**
     * @return HasManyThrough<NftActivity>
     */
    public function activities(): HasManyThrough
    {
        return $this->hasManyThrough(NftActivity::class, Nft::class);
    }

    public function recentlyViewed(): bool
    {
        if ($this->last_viewed_at === null) {
            return false;
        }

        return $this->last_viewed_at->gte(now()->subDays(1));
    }

    public function isInvalid(bool $withSpamCheck = true): bool
    {
        // Ignore collections above the supply cap
        if ($this->supply === null || $this->supply > config('dashbrd.collections_max_cap')) {
            return true;
        }

        // Ignore explicitly blacklisted collections
        if ($this->isBlacklisted()) {
            return true;
        }

        if ($withSpamCheck && SpamContract::isSpam($this->address, $this->network)) {
            return true;
        }

        return false;
    }

    public function isBlacklisted(): bool
    {
        return BlacklistedCollections::includes($this->address);
    }
}
