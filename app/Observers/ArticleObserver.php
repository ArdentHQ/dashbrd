<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Article;
use Illuminate\Support\Facades\Cache;

class ArticleObserver
{
    public function created(Article $article): void
    {
        $this->forgetMetaDescriptionCache($article);
    }

    public function updated(Article $article): void
    {
        $this->forgetMetaDescriptionCache($article);
    }

    private function forgetMetaDescriptionCache(Article $article): void
    {
        if ($article->isNotPublished()) {
            return;
        }

        if (! ($article->wasRecentlyCreated || $article->wasChanged(['meta_description', 'content', 'is_published']))) {
            return;
        }

        Cache::forget("article:{$article->id}:meta_description");
    }
}
