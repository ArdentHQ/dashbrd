<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CurrencyCode;
use App\Enums\TokenType;
use App\Models\Collection as CollectionModel;
use App\Models\Traits\BelongsToUser;
use App\Models\Traits\CanBeLiked;
use App\Models\Traits\Reportable;
use App\Notifications\GalleryReport;
use CyrildeWit\EloquentViewable\Contracts\Viewable;
use CyrildeWit\EloquentViewable\InteractsWithViews;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Staudenmeir\EloquentEagerLimit\HasEagerLimit;

/**
 * @property int $views_count
 */
class Gallery extends Model implements Viewable
{
    use BelongsToUser, CanBeLiked, HasEagerLimit, HasFactory, InteractsWithViews, Reportable, SoftDeletes;
    use HasSlug {
        otherRecordExistsWithSlug as baseOtherRecordExistsWithSlug;
    }

    /**
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'cover_image',
    ];

    protected $casts = [
        'value' => 'json',
    ];

    protected function likesTable(): string
    {
        return 'gallery_likes';
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
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * @return BelongsToMany<Nft>
     */
    public function nfts(): BelongsToMany
    {
        return $this->belongsToMany(Nft::class, 'nft_gallery')
                    ->where('type', TokenType::Erc721)
                    ->whereNull('nft_gallery.deleted_at')
                    ->withPivot('order_index');
    }

    public function value(CurrencyCode $currency): ?float
    {
        return Arr::get($this->value, $currency->value);
    }

    /**
     * @see `app/Support/Cache/GalleryCache.php` for the cached version
     *
     * @return Collection<int, CollectionModel>
     */
    public function collections(): Collection
    {
        return CollectionModel::where('type', TokenType::Erc721)->whereIn('id', function ($query) {
            return $query->select('collection_id')->from('nfts')->whereIn('nfts.id', function ($query) {
                return $query->select('nft_id')->from('nft_gallery')->where('gallery_id', $this->id);
            });
        })->get();
    }

    /**
     * @see `app/Support/Cache/GalleryCache.php` for the cached version
     */
    public function nftsCount(): int
    {
        return $this->nfts()->count();
    }

    /**
     * @see `app/Support/Cache/GalleryCache.php` for the cached version
     */
    public function collectionsCount(): int
    {
        return DB::table('nfts')->whereIn('id', function ($query) {
            return $query->select('nft_id')->from('nft_gallery')->where('gallery_id', $this->id);
        })->distinct()->count('collection_id');
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

        return $query->where(function ($query) use ($searchQuery) {
            return $query
                ->where('name', 'ilike', sprintf('%%%s%%', $searchQuery))
                ->orWhereHas('user.wallet', fn ($q) => $q->where('address', $searchQuery));
        });
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopePopular(Builder $query): Builder
    {
        return $query->orderBy('score', 'desc');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeMostValuable(Builder $query, CurrencyCode $currency): Builder
    {
        return $query->orderByRaw("COALESCE(CAST(value->>'".$currency->value."' AS decimal), 0) DESC");
    }

    /**
     * @param  null|array<int>  $galleriesIds
     */
    public static function updateValues(array $galleriesIds = null): void
    {
        $calculateValueQuery = get_query('gallery.calculate_value');

        $query = $galleriesIds === null ? Gallery::query() : Gallery::whereIn('galleries.id', $galleriesIds);

        $query->update(['value' => DB::raw($calculateValueQuery)]);
    }

    public static function updateScores(): void
    {
        $calculateScoreQuery = get_query('gallery.calculate_score');

        Gallery::query()->update([
            'score' => DB::raw(
                sprintf(
                    $calculateScoreQuery,
                    config('dashbrd.gallery.popularity_score.like'),
                    config('dashbrd.gallery.popularity_score.view'),
                    (new self)->getMorphClass()
                )
            ),
        ]);
    }

    public function newReportNotification(Report $report): Notification
    {
        return new GalleryReport($report);
    }

    protected function reportingThrottleDuration(): int
    {
        return (int) config('dashbrd.reports.throttle.gallery.same_gallery_per_hours');
    }

    protected function otherRecordExistsWithSlug(string $slug): bool
    {
        if (in_array($slug, ['newest', 'most-popular', 'most-valuable'])) {
            return true;
        }

        return $this->baseOtherRecordExistsWithSlug($slug);
    }
}
