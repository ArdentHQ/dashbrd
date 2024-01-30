<?php

declare(strict_types=1);

namespace App\Observers;

use App\Jobs\ConvertArticleToSpeech;
use App\Models\Article;
use Illuminate\Support\Facades\Cache;

class ArticleObserver
{
    public function created(Article $article): void
    {
        $this->prepareArticleSpeech($article);

        $this->forgetMetaDescriptionCache($article);
    }

    public function updated(Article $article): void
    {
        $this->prepareArticleSpeech($article);

        $this->forgetMetaDescriptionCache($article);
    }

    public function saved(): void
    {
        $this->flushCache();
    }

    public function deleted(): void
    {
        $this->flushCache();
    }

    public function restored(): void
    {
        $this->flushCache();
    }

    private function flushCache(): void
    {
        // Flush the cached articles used on the "Collections" page...
        Cache::forget('articles:latest');
        Cache::forget('articles:popular');
    }

    private function prepareArticleSpeech(Article $article): void
    {
        if (! config('dashbrd.text_to_speech.enabled')) {
            return;
        }

        if (! ConvertArticleToSpeech::$enabled) {
            return;
        }

        if ($article->isNotPublished()) {
            return;
        }

        if (! ($article->wasRecentlyCreated || $article->wasChanged(['content', 'is_published']))) {
            return;
        }

        ConvertArticleToSpeech::dispatch($article);
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
