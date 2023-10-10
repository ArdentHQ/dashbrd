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

it('gets meta description from attribute', function () {
    $article = Article::factory()->create([
        'meta_description' => 'This is a meta description',
        'content' => 'This is the content',
    ]);

    expect($article->metaDescription())->toBe('This is a meta description');
});

it('gets meta description from content if meta description is not set', function () {
    $article = Article::factory()->create([
        'meta_description' => null,
        'content' => 'This is the content',
    ]);

    expect($article->metaDescription())->toBe('This is the content');
});

it('truncates the content if used as meta description', function () {
    $article = Article::factory()->create([
        'meta_description' => null,
        'content' => str_repeat('a', 300),
    ]);

    expect($article->metaDescription())->toHaveLength(160);
});

it('determines that article is published if published_at is in the past', function () {
    $article = Article::factory()->create([
        'published_at' => now()->subDay(),
    ]);

    expect($article->isNotPublished())->toBeFalse();
});

it('determines that article is published if published_at is now', function () {
    $article = Article::factory()->create([
        'published_at' => now(),
    ]);

    expect($article->isNotPublished())->toBeFalse();
});

it('determines that article is not published if published_at is in the future', function () {
    $article = Article::factory()->create([
        'published_at' => now()->addMinute(),
    ]);

    expect($article->isNotPublished())->toBeTrue();
});

it('determines that article is not published if published_at is null', function () {
    $article = Article::factory()->create([
        'published_at' => null,
    ]);

    expect($article->isNotPublished())->toBeTrue();
});
