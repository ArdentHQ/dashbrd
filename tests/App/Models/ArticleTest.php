<?php

declare(strict_types=1);

use App\Enums\CurrencyCode;
use App\Enums\NftTransferType;
use App\Models\Article;
use App\Models\Collection;
use App\Models\CollectionTrait;
use App\Models\Gallery;
use App\Models\Nft;
use App\Models\NftActivity;
use App\Models\User;
use App\Models\Wallet;

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
