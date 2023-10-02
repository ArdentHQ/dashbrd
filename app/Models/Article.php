<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ArticleCategoryEnum;
use App\Models\Traits\BelongsToUser;
use CyrildeWit\EloquentViewable\Contracts\Viewable;
use CyrildeWit\EloquentViewable\InteractsWithViews;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Sluggable\SlugOptions;
use Spatie\Sluggable\HasSlug;

class Article extends Model implements HasMedia, Viewable
{
    use BelongsToUser, HasFactory, InteractsWithMedia, InteractsWithViews, SoftDeletes, HasSlug;

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
        return $this->belongsToMany(Collection::class, 'article_collection');
    }

    public function getSlugOptions() : SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title')
            ->saveSlugsTo('slug')
            ->doNotGenerateSlugsOnUpdate();
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
