<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Data\Articles\ArticleData;
use App\Models\Article;
use Illuminate\Support\Facades\Cache;
use Spatie\LaravelData\DataCollection;

class ArticleRepository
{
    /**
     * Get the 8 latest articles for the home page.
     *
     * @return DataCollection<int, ArticleData>
     */
    public function latest(): DataCollection
    {
        // TTL is mostly irrelevant here as the cache will be flushed whenever any article is
        // updated and whenever we update the view count (once an hour)...
        $ttl = now()->addHours(24);

        return Cache::remember('articles:latest', $ttl, function () {
            $articles = Article::isPublished()
                            ->with('media', 'user.media')
                            ->withRelatedCollections()
                            ->sortByPublishedDate()
                            ->limit(8)
                            ->get();

            return ArticleData::collection($articles);
        });
    }

    /**
     * Get the 8 most popular articles for the home page.
     *
     * @return DataCollection<int, ArticleData>
     */
    public function popular(): DataCollection
    {
        // TTL is mostly irrelevant here as the cache will be flushed whenever any article is
        // updated and whenever we update the view count (once an hour)...
        $ttl = now()->addHours(24);

        return Cache::remember('articles:popular', $ttl, function () {
            $articles = Article::isPublished()
                            ->with('media', 'user.media')
                            ->withRelatedCollections()
                            ->sortByPopularity()
                            ->limit(8)
                            ->get();

            return ArticleData::collection($articles);
        });
    }
}
