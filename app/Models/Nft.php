<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\NftTransferType;
use App\Enums\TraitDisplayType;
use App\Models\Traits\BelongsToWallet;
use App\Models\Traits\Reportable;
use App\Notifications\NftReport;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notification;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Facades\DB;
use Spatie\SchemalessAttributes\Casts\SchemalessAttributes;
use Staudenmeir\EloquentEagerLimit\HasEagerLimit;

/** @property string $token_number */
class Nft extends Model
{
    use BelongsToWallet, HasEagerLimit, HasFactory, Reportable, SoftDeletes;

    /**
     * @var array<string>
     */
    protected $fillable = [
        'wallet_id',
        'name',
        'extra_attributes',
        'token_number',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'last_viewed_at' => 'datetime',
        'last_activity_fetched_at' => 'datetime',
        'extra_attributes' => SchemalessAttributes::class,
    ];

    /**
     * @return BelongsTo<Collection, Nft>
     */
    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    /**
     * @return BelongsTo<Wallet, Nft>
     */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * @return BelongsToMany<Gallery>
     */
    public function galleries(): BelongsToMany
    {
        return $this->belongsToMany(Gallery::class, 'nft_gallery');
    }

    /**
     * @return BelongsToMany<CollectionTrait>
     */
    public function traits(): BelongsToMany
    {
        return $this->belongsToMany(CollectionTrait::class, 'nft_trait', 'nft_id', 'trait_id', 'id')
            ->using(NftTrait::class)
            ->withPivot(['value_string', 'value_numeric', 'value_date']);
    }

    /**
     * @return HasMany<NftActivity>
     */
    public function activities(): HasMany
    {
        return $this->hasMany(
            NftActivity::class, foreignKey: 'token_number', localKey: 'token_number'
        )->where('collection_id', $this->collection_id);
    }

    /**
     * @return array{
     *   thumb: string|null,
     *   small: string|null,
     *   large: string|null,
     *   original: string|null,
     *   originalRaw: string|null,
     * }
     */
    public function images(): array
    {
        return [
            'thumb' => $this->extra_attributes->get('images.thumb'),
            'small' => $this->extra_attributes->get('images.small'),
            'large' => $this->extra_attributes->get('images.large'),
            'original' => $this->extra_attributes->get('images.original'),
            'originalRaw' => $this->extra_attributes->get('images.originalRaw'),
        ];
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->whereHas('wallet', fn ($q) => $q->where('user_id', $user->id));
    }

    /**
     * @param  Builder<self>  $query
     * @param  array<string, array<string, string[]>>  $traits
     * @return Builder<self>
     */
    public function scopeWithTraits(Builder $query, array $traits): Builder
    {
        $hasValues = collect($traits)->some(fn ($values) => count($values) > 0);

        if (! $hasValues) {
            return $query;
        }

        return $query->where(function ($query) use ($traits) {
            foreach ($traits as $name => $valuePairs) {
                foreach ($valuePairs as $type => $values) {
                    $displayType = TraitDisplayType::from($type);

                    $query->whereHas('traits', function (Builder $traitsQuery) use ($name, $displayType, $values) {
                        $traitsQuery->where('name', $name);

                        if ($displayType === TraitDisplayType::Date) {
                            return $traitsQuery->whereIn('value_date', $values);
                        }

                        if ($displayType->isNumeric()) {
                            return $traitsQuery->whereIn('value_numeric', $values);
                        }

                        return $traitsQuery->whereIn('value_string', $values);
                    });
                }
            }
        });
    }

    /**
     * @param  Builder<self>  $query
     * @param array{
     *   owned: bool,
     *   traits: array<string, array<string, string[]>> | null,
     * } $filters
     * @return Builder<self>
     */
    public function scopeFilter(Builder $query, array $filters, ?User $user): Builder
    {
        if ($filters['owned'] && $user) {
            $query->ownedBy($user);
        }

        if ($filters['traits'] !== null) {
            $query->withTraits($filters['traits']);
        }

        return $query;
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOrderByOwnership(Builder $query, User $user): Builder
    {
        return $query->leftJoin('wallets', 'nfts.wallet_id', '=', 'wallets.id')
            ->orderByRaw('CASE WHEN wallets.user_id = ? THEN 1 ELSE 0 END DESC', [$user->id]);
    }

    /**
     * @param  Builder<self>  $query
     * @param  'asc'|'desc'  $direction
     * @return Builder<self>
     */
    public function scopeOrderByMintDate(Builder $query, string $direction = 'asc'): Builder
    {
        // "Mint Date" is stored a timestamp for the activity item with a "mint" type...
        $select = "
                SELECT timestamp
                FROM nft_activity
                WHERE nft_activity.collection_id = nfts.collection_id AND nft_activity.token_number = nfts.token_number AND type = '".NftTransferType::Mint->value."'
                ORDER BY timestamp DESC
        ";

        if ($direction === 'asc') {
            return $query->orderByRaw(sprintf('(%s) ASC NULLS FIRST', $select));
        }

        return $query->orderByRaw(sprintf('(%s) DESC NULLS LAST', $select));
    }

    /**
     * @param  Builder<self>  $query
     * @param  'asc'|'desc'  $direction
     * @return Builder<self>
     */
    public function scopeOrderByReceivedDate(Builder $query, string $direction = 'asc'): Builder
    {
        // "Received Date" is stored a timestamp for the activity item with a "transfer" type...
        $select = "
                SELECT timestamp
                FROM nft_activity
                WHERE nft_activity.collection_id = nfts.collection_id AND nft_activity.token_number = nfts.token_number AND type = '".NftTransferType::Transfer->value."'
                ORDER BY timestamp DESC
                LIMIT 1
        ";

        if ($direction === 'asc') {
            return $query->orderByRaw(sprintf('(%s) ASC NULLS FIRST', $select));
        }

        return $query->orderByRaw(sprintf('(%s) DESC NULLS LAST', $select));
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeSearch(Builder $query, ?string $searchQuery): Builder
    {
        if ($searchQuery === null || $searchQuery === '') {
            return $query;
        }

        $searchQuery = [sprintf('%%%s%%', $searchQuery)];

        return $query->where(function ($query) use ($searchQuery) {
            $query->whereRaw("concat(nfts.name, ' #', nfts.token_number) ilike ?", $searchQuery)
                ->orWhereRaw("concat(nfts.name, ' ', nfts.token_number) ilike ?", $searchQuery);
        });
    }

    public function newReportNotification(Report $report): Notification
    {
        return new NftReport($report);
    }

    protected function reportingThrottleDuration(): int
    {
        return config('dashbrd.reports.throttle.nft.same_nft_per_hours');
    }

    /**
     * This method is used to paginate Collections NFTs.
     * The sub-query partitions the NFT table based on the "collection_id" column,
     * assigns row numbers within each partition based on the "id" column, and then
     * selects only the rows where the row number is less than or equal to $nftsPerPage.
     *
     * @param  LengthAwarePaginator<Collection>  $collections
     * @return SupportCollection<int, Nft>
     */
    public static function paginatedCollectionNfts(
        LengthAwarePaginator $collections,
        User $user,
        int $nftsPerPage = 10
    ): SupportCollection {
        $subQuery = DB::table('nfts')
            ->select('*', DB::raw('ROW_NUMBER() OVER (PARTITION BY collection_id ORDER BY id) AS rn'))
            ->whereIn('collection_id', $collections->pluck('id'))
            ->whereIn('wallet_id', $user->wallets()->select('id'));

        $nfts = DB::table(DB::raw("({$subQuery->toSql()}) AS subquery"))
            ->mergeBindings($subQuery)
            ->select('*')
            ->where('rn', '<=', $nftsPerPage)
            ->get();

        return Nft::hydrate($nfts->toArray())
            ->each(fn (Nft $nft) => $nft->setRelation(
                'collection',
                $collections->firstWhere('id', $nft->collection_id)
            ));
    }
}
