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

    public function metaDescription(): string
    {
        return $this->meta_description ?? Str::limit(strip_tags($this->content), 157);
    }

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title')
            ->saveSlugsTo('slug')
            ->doNotGenerateSlugsOnUpdate();
    }
}
