<?php

declare(strict_types=1);

namespace App\Observers;

use App\Jobs\ConvertArticleToSpeech;
use App\Models\Article;

class ArticleObserver
{
    public function created(Article $article): void
    {
        $this->prepareArticleSpeech($article);
    }

    public function updated(Article $article): void
    {
        $this->prepareArticleSpeech($article);
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
}
