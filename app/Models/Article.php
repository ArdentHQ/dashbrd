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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Image\Manipulations;
use Spatie\LaravelMarkdown\MarkdownRenderer;
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
        'published_at' => 'datetime',
    ];

    public function resolveRouteBinding($value, $field = null)
    {
        return Article::query()->withRelatedCollections()->where('articles.slug', $value)->first();
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('cover')
            ->singleFile()
            ->registerMediaConversions(function () {
                $this
                    ->addMediaConversion('large')
                    ->width(1000);
                $this
                    ->addMediaConversion('large@2x')
                    ->width(1000 * 2);

                $this
                    ->addMediaConversion('medium')
                    ->width(573);
                $this
                    ->addMediaConversion('medium@2x')
                    ->width(573 * 2);

                $this
                    ->addMediaConversion('small')
                    ->width(114);
                $this
                    ->addMediaConversion('small@2x')
                    ->width(114 * 2);

                $this
                    ->addMediaConversion('meta')
                    ->crop(Manipulations::CROP_CENTER, 1200, 630);
            });
    }

    public function renderedMarkdown(): string
    {
        return app(MarkdownRenderer::class)->toHtml($this->content);
    }

    /**
     * @return BelongsToMany<Collection>
     */
    public function collections(): BelongsToMany
    {
        return $this->belongsToMany(Collection::class, 'article_collection')
                    ->erc721()
                    ->withPivot('order_index');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeIsPublished(Builder $query): Builder
    {
        return $query->whereNotNull('articles.published_at')
            ->where('articles.published_at', '<=', now());
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
        return $query->orderBy('articles.views_count_7days', 'desc');
    }

    /**
     * @param  Builder<self>  $query
     * @param  'asc'|'desc'  $direction
     * @return Builder<self>
     */
    public function scopeSortByPublishedDate(Builder $query, string $direction = 'desc'): Builder
    {
        $nullsPosition = Str::lower($direction) === 'asc' ? 'NULLS FIRST' : 'NULLS LAST';

        return $query->orderByRaw("articles.published_at {$direction} {$nullsPosition}");
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeWithRelatedCollections(Builder $query): Builder
    {
        return $query->with('collections:name,slug,extra_attributes');
    }

    public function metaDescription(): string
    {
        return Cache::rememberForever("article:{$this->id}:meta_description", function () {
            if (boolval($this->meta_description)) {
                return $this->meta_description;
            }

            $rawContent = $this->renderedMarkdown();

            return Str::limit(trim(preg_replace("/\r?\n/", ' ', html_entity_decode(strip_tags($rawContent)))), 157);
        });
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
        $now = now();
        $pastWeek = now()->subDays(7);

        Article::query()
            ->update([
                'views_count_7days' => DB::raw(
                    <<<SQL
(
    SELECT COUNT(*) FROM views AS v
    WHERE v.viewable_type = 'App\Models\Article'
    AND articles.id = v.viewable_id
    AND viewed_at >= '{$pastWeek}'
    AND viewed_at <= '{$now}'
)
SQL
                ),
            ]);
    }
}
