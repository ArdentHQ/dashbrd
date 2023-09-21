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

it('should add a like to an article', function () {
    $article = Article::factory()->create();

    expect($article->likes()->count())->toBe(0);

    $users = User::factory(3)->create();

    foreach ($users as $user) {
        $article->addLike($user);
    }

    expect($article->likes()->count())->toBe(3)
        ->and($article->likeCount)->toBe(3)
        ->and($article->likes()->pluck('id'))->toContain(...$users->pluck('id'));
});
