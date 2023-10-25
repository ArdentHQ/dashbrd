<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Article;
use Illuminate\Support\Facades\Cache;

class ArticleObserver
{
    public function created(Article $article): void
    {
        $this->forgeMetaDescriptionCache($article);
    }

    public function updated(Article $article): void
    {
        $this->forgeMetaDescriptionCache($article);
    }

    private function forgeMetaDescriptionCache(Article $article): void
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
