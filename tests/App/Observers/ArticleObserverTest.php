<?php

declare(strict_types=1);

use App\Models\Article;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Article::truncate();
});

it('should not clear the meta description cache if article is not published', function () {
    Cache::shouldReceive('forget')->never();

    Article::factory()->create([
        'content' => 'Hello World',
        'meta_description' => 'Hello World',
        'published_at' => null,
    ]);
});

it('should not clear the meta description cache if article content or meta description did not change', function () {
    $article = Article::factory()->create([
        'content' => 'Hello World',
        'meta_description' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ])->fresh();

    Cache::shouldReceive('forget')->never();

    $article->update([
        'title' => 'Updated title',
    ]);
});

it('should clear the meta description cache when an article created', function () {
    Cache::shouldReceive('forget')->with('article:1:meta_description')->once();

    Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ]);
});

it('should clear the meta description cache when an article content is updated', function () {
    $article = Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ]);

    Cache::shouldReceive('forget')->with('article:1:meta_description')->once();

    $article->update([
        'content' => 'Updated content',
    ]);
});

it('should clear the meta description cache when an article meta_description is updated', function () {
    $article = Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ]);

    Cache::shouldReceive('forget')->with('article:1:meta_description')->once();

    $article->update([
        'meta_description' => 'Updated content',
    ]);
});

it('should clear the meta description cache when an article is published', function () {
    $article = Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => null,
    ]);

    Cache::shouldReceive('forget')->with('article:1:meta_description')->once();

    $article->update([
        'published_at' => now()->subMinutes(2),
    ]);
});
