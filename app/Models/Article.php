<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ArticleCategoryEnum;
use App\Models\Traits\BelongsToUser;
use CyrildeWit\EloquentViewable\Contracts\Viewable;
use CyrildeWit\EloquentViewable\InteractsWithViews;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Article extends Model implements HasMedia, Viewable
{
    use BelongsToUser, HasFactory, HasSlug, InteractsWithMedia, InteractsWithViews, SoftDeletes;

    public $guarded = ['id'];

    protected $casts = [
        'category' => ArticleCategoryEnum::class,
        'published_at' => 'date',
    ];

    public function resolveRouteBinding($value, $field = null)
    {
        return Article::query()->withFeaturedCollections()->where('slug', $value)->first();
    }

    /**
     * @return BelongsToMany<Collection>
     */
    public function collections(): BelongsToMany
    {
        return $this->belongsToMany(Collection::class, 'article_collection')->withPivot('order_index');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeIsPublished(Builder $query): Builder
    {
        return $query->whereNotNull('articles.published_at');
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

        return $query->where('articles.title', 'ilike', sprintf('%%%s%%', $searchQuery));
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeSortById(Builder $query): Builder
    {
        return $query->orderBy('articles.id', 'desc');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeSortByPopularity(Builder $query): Builder
    {
        return $query->orderBy('articles.views_count', 'desc');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeWithFeaturedCollections(Builder $query, int $collectionId = null): Builder
    {
        return $query->with(['collections' => function ($query) use ($collectionId) {
            $query->when($collectionId, fn ($q) => $q->where('collections.id', '!=', $collectionId))
                ->select([
                    'collections.name',
                    'collections.slug',
                    'collections.extra_attributes->image as image',
                ]);
        }]);
    }

    public function metaDescription(): string
    {
        return $this->meta_description ?? Str::limit(strip_tags($this->content), 157);
    }

    public function isNotPublished(): bool
    {
        return $this->published_at === null || $this->published_at->isFuture();
    }

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title')
            ->saveSlugsTo('slug')
            ->doNotGenerateSlugsOnUpdate();
    }

    public static function updateViewCounts(): void
    {
        Article::query()
            ->update([
                'views_count' => DB::raw(
                    "(SELECT COUNT(*) FROM views as v WHERE v.viewable_type = 'App\Models\Article' AND articles.id = v.viewable_id)"
                ),
            ]);
    }
}
