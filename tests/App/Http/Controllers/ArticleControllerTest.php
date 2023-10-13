<?php

declare(strict_types=1);

use App\Models\Article;
use App\Models\Collection;

function seedArticles(int $articlesCount = 4, int $collectionsCount = 2): array
{
    $collections = Collection::factory($collectionsCount)->create();

    $articles = Article::factory($articlesCount)->create([
        'published_at' => now()->format('Y-m-d'),
    ]);

    $articles->map(fn ($article) => $article
        ->addMedia('database/seeders/fixtures/articles/images/discovery-of-the-day-luchadores.png')
        ->preservingOriginal()
        ->toMediaCollection('cover')
    );

    $collections->map(function ($collection) use ($articles) {
        $collection->articles()->attach($articles, ['order_index' => 1]);
    });

    return [$collections, $articles];
}

it('should render the page', function () {
    seedArticles();

    $this->get(route('articles'))
        ->assertStatus(200);
});

it('should render a single published article', function () {
    [, [$article]] = seedArticles(1);

    $this->get(route('articles.view', ['article' => $article->slug]))
        ->assertStatus(200);
});

it('should not render a single unpublished article', function () {
    [, [$article]] = seedArticles(1);

    $article->update(['published_at' => null]);

    $this->get(route('articles.view', ['article' => $article->slug]))
        ->assertStatus(404);
});

it('should return articles with the given pageLimit', function ($pageLimit, $resultCount, $page) {
    seedArticles(35, 4);

    $response = $this->getJson(route('articles', [
        'pageLimit' => $pageLimit,
        'page' => $page,
    ]))->json('articles');

    expect(count($response['paginated']['data']))->toEqual($resultCount);
})->with([
    [123, 32, 1],
    [12, 12, 2],
    [24, 24, 1],
]);

it('should search in articles', function () {
    $today = now()->format('Y-m-d');

    $article1 = Article::factory()->create([
        'title' => 'nice bunny',
        'published_at' => $today,
    ]);

    $article2 = Article::factory()->create([
        'title' => 'beautiful baku',
        'published_at' => $today,
    ]);

    collect([$article1, $article2])->map(fn ($article) => $article
        ->addMedia('database/seeders/fixtures/articles/images/discovery-of-the-day-luchadores.png')
        ->preservingOriginal()
        ->toMediaCollection()
    );

    $response = $this->getJson(route('articles', [
        'search' => 'baku',
    ]))->json('articles');

    expect(count($response['paginated']['data']))->toEqual(1)
        ->and($response['paginated']['data'][0]['title'])->toEqual('beautiful baku');
});

it('should sort articles', function () {
    $highlightedArticles = Article::factory(3)->create([
        'published_at' => now(),
    ]);

    $article1 = Article::factory()->create([
        'title' => 'nice bunny',
        'published_at' => now()->subMinutes(10),
    ]);

    $article2 = Article::factory()->create([
        'title' => 'beautiful baku',
        'published_at' => now()->subMinutes(5),
    ]);

    collect($highlightedArticles->concat([$article1, $article2]))->map(fn ($article) => $article
        ->addMedia('database/seeders/fixtures/articles/images/discovery-of-the-day-luchadores.png')
        ->preservingOriginal()
        ->toMediaCollection()
    );

    $response = $this->getJson(route('articles', [
        'sort' => 'latest',
    ]))->json('articles');

    expect(count($response['paginated']['data']))->toEqual(2)
        ->and($response['paginated']['data'][0]['title'])->toEqual('beautiful baku') // article2
        ->and($response['paginated']['data'][1]['title'])->toEqual('nice bunny'); // article1
});

it('should get featured collections for an article', function () {
    seedArticles(5, 2);

    $response = $this->getJson(route('articles'))->json('articles');

    expect(count($response['paginated']['data'][0]['featuredCollections']))->toEqual(2);
});
