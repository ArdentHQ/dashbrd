<?php

declare(strict_types=1);

use App\Models\Article;
use App\Models\Collection;
use Illuminate\Support\Facades\DB;

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
        'published_at' => now()->addDay(),
    ]);

    expect($article->isNotPublished())->toBeTrue();
});

it('determines that article is not published if published_at is null', function () {
    $article = Article::factory()->create([
        'published_at' => null,
    ]);

    expect($article->isNotPublished())->toBeTrue();
});

it('should get article\'s collections', function () {
    $collections = Collection::factory(2)->create();

    $articles = Article::factory(2)->create([
        'published_at' => now()->format('Y-m-d'),
    ]);

    $collections->map(function ($collection) use ($articles) {
        $collection->articles()->attach($articles, ['order_index' => 1]);
    });

    $result = $articles->first()->withFeaturedCollections()->first();

    expect($result->collections->count())->toBe(2)
        ->and($result->collections->pluck('name'))->toContain($collections[0]->name)
        ->and($result->collections->pluck('name'))->toContain($collections[1]->name);
});

it('should update article view counts', function () {
    $articles = Article::factory(3)->create();

    views($articles[0])->record();

    views($articles[1])->record();
    views($articles[1])->record();
    views($articles[1])->record();

    DB::table('views')->insert([
        'viewable_id' => $articles[0]->id,
        'viewable_type' => 'App\Models\Article',
        'visitor' => 'abcdef',
        'viewed_at' => now()->subDays(8),
    ]);

    Article::updateViewCounts();

    $articles = Article::query()->orderBy('id', 'asc')->get();

    expect($articles[0]->views_count_7days)->toBe(1)
        ->and($articles[1]->views_count_7days)->toBe(3)
        ->and($articles[2]->views_count_7days)->toBe(0);
});
