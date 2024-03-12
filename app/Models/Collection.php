<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\StrippedHtml;
use App\Enums\CurrencyCode;
use App\Enums\TokenType;
use App\Models\Traits\BelongsToNetwork;
use App\Models\Traits\HasFloorPriceHistory;
use App\Models\Traits\HasVolume;
use App\Models\Traits\HasWalletVotes;
use App\Models\Traits\Reportable;
use App\Notifications\CollectionReport;
use App\Support\BlacklistedCollections;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\SchemalessAttributes\Casts\SchemalessAttributes;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Staudenmeir\EloquentEagerLimit\HasEagerLimit;

/**
 * @property ?int $supply
 * @property ?string $floor_price
 * @property ?string $last_indexed_token_number
 * @property ?string $image
 * @property \Illuminate\Database\Eloquent\Collection<int,Nft> $cachedNfts
 *
 * @method BelongsToMany<Article> articlesWithCollections()
 */
class Collection extends Model
{
    use BelongsToNetwork, HasEagerLimit, HasFactory, HasFloorPriceHistory,
        HasSlug, HasVolume, HasWalletVotes, Reportable, SoftDeletes;

    const TWITTER_URL = 'https://x.com/';

    const DISCORD_URL = 'https://discord.gg/';

    /**
     * @var \Illuminate\Database\Eloquent\Collection<int, Nft>
     */
    public $cachedNfts;

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
        'type' => TokenType::class,
        'floor_price_retrieved_at' => 'datetime',
        'extra_attributes' => SchemalessAttributes::class,
        'fiat_value' => 'json',
        'minted_block' => 'int',
        'minted_at' => 'datetime',
        'last_viewed_at' => 'datetime',
        'is_fetching_activity' => 'bool',
        'activity_updated_at' => 'datetime',
        'activity_update_requested_at' => 'datetime',
        'is_featured' => 'bool',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('erc721', function (Builder $query) {
            $query->where('collections.type', TokenType::Erc721->value);
        });
    }

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
            ->generateSlugsFrom(fn (self $model) => $this->preventForbiddenSlugs($model))
            ->saveSlugsTo('slug');
    }

    private function preventForbiddenSlugs(self $model): string
    {
        $forbidden = ['collection-of-the-month', 'popular'];

        if (in_array(Str::slug($model->name), $forbidden, true)) {
            return $model->name.' Collection';
        }

        return $model->name;
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

    /**
     * @return BelongsToMany<Article>
     */
    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class, 'article_collection')->withPivot('order_index');
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

    public function openSeaSlug(): ?string
    {
        return $this->extra_attributes->get('opensea_slug');
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
    public function scopeErc721(Builder $query): Builder
    {
        return $query->where('collections.type', TokenType::Erc721);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOrderByValue(Builder $query, ?Wallet $wallet, ?string $direction, ?CurrencyCode $currency = CurrencyCode::USD): Builder
    {
        $walletFilter = $wallet ? "WHERE nfts.wallet_id = $wallet->id" : '';

        return $query->selectRaw(
            sprintf('collections.*, (CAST(collections.fiat_value->>\'%s\' AS float)::float * MAX(nc.nfts_count)::float) as total_value', $currency->value)
        )
            ->leftJoin(DB::raw("(
                SELECT
                    collection_id,
                    count(*) as nfts_count
                FROM nfts
                {$walletFilter}
                GROUP BY collection_id
            ) nc"), 'collections.id', '=', 'nc.collection_id')
            ->groupBy('collections.id')
            ->orderByWithNulls('total_value', $direction)
            ->orderBy('collections.id', $direction);
    }

    /**
     * @param  Builder<self>  $query
     * @param  'asc'|'desc'  $direction
     * @return Builder<self>
     */
    public function scopeOrderByFloorPrice(Builder $query, string $direction, CurrencyCode $currency = CurrencyCode::USD): Builder
    {
        return $query->selectRaw(
            sprintf('collections.*, CAST(collections.fiat_value->>\'%s\' AS float) as total_floor_price', $currency->value)
        )->orderByWithNulls('total_floor_price', $direction);
    }

    /**
     * @param  Builder<self>  $query
     * @param  'asc'|'desc'  $direction
     * @return Builder<self>
     */
    public function scopeOrderByName(Builder $query, string $direction): Builder
    {
        return $query->orderByWithNulls('lower(collections.name)', $direction);
    }

    /**
     * @param  Builder<self>  $query
     * @param  'asc'|'desc'  $direction
     * @return Builder<self>
     */
    public function scopeOrderByMintDate(Builder $query, string $direction): Builder
    {
        return $query->orderByWithNulls('minted_at', $direction);
    }

    /**
     * @param  Builder<self>  $query
     * @param  'asc'|'desc'  $direction
     * @return Builder<self>
     */
    public function scopeOrderByReceivedDate(Builder $query, Wallet $wallet, string $direction): Builder
    {
        // this is to ensure that `addSelect` doesn't override the `select collections.*`
        if (empty($query->getQuery()->columns)) {
            $query->select($this->qualifyColumn('*'));
        }

        $query->leftJoin('nft_activity', function (JoinClause $join) use ($wallet) {
            $join->on('nft_activity.collection_id', '=', 'collections.id')
                ->where('nft_activity.recipient', '=', $wallet->address);
        })
            ->addSelect(DB::raw('MAX(nft_activity.timestamp) as received_at'))
            ->groupBy('collections.id');

        return $query->orderByWithNulls('received_at', $direction);
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
    public function scopeFilterByChainId(Builder $query, ?int $chainId): Builder
    {
        if (empty($chainId)) {
            return $query;
        }

        /** @var Network $network */
        $network = Network::query()
            ->select('id')
            ->where('networks.chain_id', $chainId)
            ->first();

        return $query->where('collections.network_id', $network->id);
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
    public function scopeSearchByName(Builder $query, ?string $searchQuery): Builder
    {
        if ($searchQuery === null || $searchQuery === '') {
            return $query;
        }

        return $query->where('collections.name', 'ilike', sprintf('%%%s%%', $searchQuery));
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
    public function scopeNotHidden($query, User $user)
    {
        return $query->whereNotIn('collections.id', $user->hiddenCollections()->pluck('id')->toArray());
    }

    /**
     * @return HasOne<SpamContract>
     */
    public function spamContract(): HasOne
    {
        return $this->hasOne(SpamContract::class, 'address', 'address')->when(
            $this->network_id !== null, fn ($query) => $query->where('network_id', $this->network_id)
        );
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeWithoutSpamContracts(Builder $query): Builder
    {
        return $query->whereDoesntHave('spamContract', function ($query) {
            $query->whereColumn('collections.network_id', 'spam_contracts.network_id');
        });
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
     * Query only the collections that are used by signed wallets.
     *
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeWithSignedWallets(Builder $query): Builder
    {
        return $query->whereHas('nfts.wallet', fn ($q) => $q->whereNotNull('last_signed_at'));
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
     * @return HasMany<NftActivity>
     */
    public function activities(): HasMany
    {
        return $this->hasMany(NftActivity::class);
    }

    public function recentlyViewed(): bool
    {
        if ($this->last_viewed_at === null) {
            return false;
        }

        return $this->last_viewed_at->gte(now()->subDays(1));
    }

    /**
     * Determine whether the collection is *potentially* full. We call it "potentially" because there is no way for
     * us to be 100% sure that the collection is full and we make our best guess.
     */
    public function isPotentiallyFull(): bool
    {
        // If there is no supply or if the NFTs for the collection haven't been indexed, we know for sure it's not full...
        if ($this->last_indexed_token_number === null || $this->supply === null) {
            return false;
        }

        /** @var string|int $lastToken */
        $lastToken = $this->last_indexed_token_number;

        // We cast to string as `last_indexed_token_number` can be very, very large (non-integer)...
        $supply = (string) $this->supply;
        $lastIndexed = (string) $this->last_indexed_token_number;

        // If supply matches the last indexed NFT, we can assume it's potentially full...
        if ($supply === $lastIndexed) {
            return true;
        }

        $count = $this->nfts()->count();

        // Some collection NFT IDs start from 0 so we gotta take that into account...
        if (
            is_int($lastToken) &&
            $this->supply === $lastToken + 1 &&
            $this->supply === $count
        ) {
            return true;
        }

        // Handles case where token number is an arbitrary value, but much larger than the supply...
        if (! is_int($lastToken) && $supply < $lastIndexed && $this->supply === $count) {
            return true;
        }

        // Handles the burn scenario, causing the supply to decrease over time...
        return $this->supply <= $count;
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

    public function indexesActivities(): bool
    {
        /**
         * @var string[]
         */
        $blacklisted = config('dashbrd.activity_blacklist', []);

        if (collect($blacklisted)->map(fn ($collection) => Str::lower($collection))->contains(Str::lower($this->address))) {
            return false;
        }

        return ! $this->isInvalid();
    }

    public function isBlacklisted(): bool
    {
        return BlacklistedCollections::includes($this->address);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOrderByOldestNftLastFetchedAt(Builder $query): Builder
    {
        return $query->orderByWithNulls('extra_attributes->>\'nft_last_fetched_at\'', 'asc');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOrderByFloorPriceLastFetchedAt(Builder $query): Builder
    {
        return $query->orderByWithNulls('extra_attributes->>\'floor_price_last_fetched_at\'', 'asc');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOrderByOpenseaSlugLastFetchedAt(Builder $query): Builder
    {
        return $query->orderByWithNulls('extra_attributes->>\'opensea_slug_last_fetched_at\'', 'asc');
    }

    public function isSpam(): bool
    {
        return SpamContract::isSpam($this->address, $this->network);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeVotedByUserInCurrentMonth(Builder $query, User $user): Builder
    {
        return $query->whereHas('votes', fn ($q) => $q->inCurrentMonth()->where('wallet_id', $user->wallet_id));
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeWinnersOfThePreviousMonth(Builder $query): Builder
    {
        return $query
            ->withCount(['votes' => fn ($query) => $query->inPreviousMonth()])
            // order by votes count excluding nulls
            ->whereHas('votes', fn ($query) => $query->inPreviousMonth())
            ->orderBy('votes_count', 'desc');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeEligibleToWin(Builder $query): Builder
    {
        return $query->whereNotIn('collections.id', CollectionWinner::ineligibleCollectionIds());
    }

    /**
     * @return array<string, mixed>
     */
    public static function getFiatValueSum(): array
    {
        return DB::select('SELECT
                key, COALESCE(SUM(value::numeric), 0) as total
            FROM
                collections, jsonb_each_text(fiat_value) as currencies(key,value)
            GROUP BY key;'
        );
    }

    /**
     * Modify the query to apply ORDER BY, but with respect to NULL values.
     * If direction is ascending, the query will order NULL values first,
     * otherwise it will order NULL values last.
     *
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOrderByWithNulls(Builder $query, string $column, string $direction): Builder
    {
        $nullsPosition = strtolower($direction) === 'asc'
                        ? 'NULLS FIRST'
                        : 'NULLS LAST';

        return $query->orderByRaw("{$column} {$direction} {$nullsPosition}");
    }
}
