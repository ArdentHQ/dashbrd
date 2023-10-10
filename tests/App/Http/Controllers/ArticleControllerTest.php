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
        ->toMediaCollection()
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

it('should return articles with the given pageLimit', function ($pageLimit, $resultCount) {
    seedArticles(35, 4);

    $response = $this->getJson(route('articles', [
        'pageLimit' => $pageLimit,
    ]))->json('articles');

    expect(count($response['paginated']['data']))->toEqual($resultCount);
})->with([
    [123, 35],
    [12, 12],
    [24, 24],
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
        'sort' => 'latest',
    ]))->json('articles');

    expect(count($response['paginated']['data']))->toEqual(2)
        ->and($response['paginated']['data'][0]['title'])->toEqual('nice bunny')
        ->and($response['paginated']['data'][1]['title'])->toEqual('beautiful baku');
});

it('should get featured collections for an article', function () {
    seedArticles(2, 2);

    $response = $this->getJson(route('articles'))->json('articles');

    expect(count($response['paginated']['data'][0]['featuredCollections']))->toEqual(2);
});
