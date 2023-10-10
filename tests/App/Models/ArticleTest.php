<?php

declare(strict_types=1);

use App\Models\Article;
use App\Models\Collection;

it('should create an article', function () {
    $article = Article::factory()->create();

    expect($article->title)->not()->toBeNull();
});

it('should have a collection', function () {
    $article = Article::factory()->create();

    $collection = Collection::factory()->create();

    $article->collections()->attach($collection, ['order_index' => 1]);

    expect($article->collections->first()->id)->toBe($collection->id);
});

it('should sort collections with ID', function () {
    $createdArticles = Article::factory(2)->create();

    $articles = Article::query()->sortById()->get();

    expect($articles[0]->id)->toBe($createdArticles[1]->id)
        ->and($articles[1]->id)->toBe($createdArticles[0]->id);
});
