<?php

namespace App\Models;

use App\Models\Traits\BelongsToUser;
use App\Models\Traits\CanBeLiked;
use CyrildeWit\EloquentViewable\InteractsWithViews;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\InteractsWithMedia;

class Article extends Model
{
    use BelongsToUser, CanBeLiked, HasFactory, InteractsWithViews, SoftDeletes, InteractsWithMedia;

    public $guarded = ['id'];

    protected function likesTable(): string
    {
        return 'article_likes';
    }

    /**
     * @return BelongsToMany<Collection>
     */
    public function collections(): BelongsToMany
    {
        return $this->belongsToMany(Collection::class, 'article_collection');
    }
}
