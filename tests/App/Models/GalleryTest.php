<?php

declare(strict_types=1);

use App\Enums\CurrencyCode;
use App\Models\Collection;
use App\Models\Gallery;
use App\Models\Nft;
use App\Models\Report;
use App\Models\Token;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;

it('can create a basic gallery', function () {
    $gallery = Gallery::factory()->create();

    expect($gallery->name)->not()->toBeNull();
});

it('can retrieve the nfts that belong to the gallery', function () {
    $nft = Nft::factory()->create();
    $gallery = Gallery::factory()->create();

    expect($gallery->nfts()->count())->toBe(0);

    $gallery->nfts()->attach($nft->id, ['order_index' => 1]);

    expect($gallery->nfts()->count())->toBe(1);
});

it('doest not retrieve soft deleted nfts', function () {
    $nft = Nft::factory()->create();
    $gallery = Gallery::factory()->create();

    expect($gallery->nfts()->count())->toBe(0);

    $gallery->nfts()->attach($nft->id, ['order_index' => 1, 'deleted_at' => Carbon::now()]);

    expect($gallery->nfts()->count())->toBe(0);
});

it('should add a like to a gallery', function () {
    $gallery = Gallery::factory()->create();

    expect($gallery->likes()->count())->toBe(0);

    $users = User::factory(10)->create();
    foreach ($users as $user) {
        $gallery->addLike($user);
    }

    expect($gallery->likes()->count())->toBe(10);
    expect($gallery->likeCount)->toBe(10);
    expect($gallery->likes()->pluck('id'))->toContain(...$users->pluck('id'));
});

it('should remove a like from a gallery', function () {
    $gallery = Gallery::factory()->create();

    $users = User::factory(10)->create();
    foreach ($users as $user) {
        $gallery->addLike($user);
    }

    expect($gallery->likes()->count())->toBe(10);

    $dislikedUsers = $users->splice(5)->each(fn ($user) => $gallery->removeLike($user));

    expect($gallery->likes()->count())->toBe(5);
    expect($gallery->likeCount)->toBe(5);
    expect($gallery->likes()->pluck('id'))->not->toContain(...$dislikedUsers->pluck('id'));
});

it('should only like a gallery once per user', function () {
    $gallery = Gallery::factory()->create();

    $user = User::factory()->create();
    $gallery->addLike($user);
    $gallery->addLike($user);
    $gallery->addLike($user);

    expect($gallery->likes()->count())->toBe(1);
    expect($gallery->likeCount)->toBe(1);
});

it('should allow a user to like many galleries', function () {
    $user = User::factory()->create();
    $galleries = Gallery::factory(10)->create()->each(fn ($gallery) => $gallery->addLike($user));

    foreach ($galleries as $gallery) {
        expect($gallery->likes()->count())->toBe(1);
        expect($gallery->likeCount)->toBe(1);
        expect($gallery->isLikedBy($user))->toBeTrue();
    }
});

it('should get the cached like count', function () {
    Cache::setDefaultDriver('redis');
    Cache::store('redis')->flush();

    $user = User::factory()->create();
    $gallery = Gallery::factory()->create();

    expect($gallery->fresh()->likes()->count())->toBe(0);
    expect($gallery->fresh()->likeCount)->toBe(0);

    $gallery->likes()->attach($user);

    $gallery = Gallery::find($gallery->id);

    expect($gallery->likes()->count())->toBe(1);
    expect($gallery->likeCount)->toBe(0);
});

it('should clear gallery cached like count when updated', function () {
    Cache::setDefaultDriver('redis');
    Cache::store('redis')->flush();

    $user = User::factory()->create();
    $gallery = Gallery::factory()->create();

    expect($gallery->fresh()->likes()->count())->toBe(0);
    expect($gallery->fresh()->likeCount)->toBe(0);

    $gallery->likes()->attach($user);

    expect($gallery->fresh()->likes()->count())->toBe(1);
    expect($gallery->fresh()->likeCount)->toBe(0);

    $gallery->addLike(User::factory()->create());

    expect($gallery->fresh()->likes()->count())->toBe(2);
    expect($gallery->fresh()->likeCount)->toBe(2);
});

it('should calculate the total gallery value', function () {
    $weth = Token::factory()->wethWithPrices()->create();
    $collection = Collection::factory()->create([
        'floor_price' => 2.1 * 1e18,
        'floor_price_token_id' => $weth->id,
    ]);
    $gallery = Gallery::factory()->create();
    $nft = Nft::factory()->create([
        'collection_id' => $collection->id,
    ]);

    $gallery->nfts()->attach($nft, ['order_index' => 0]);

    Gallery::updateValues([$gallery->id]);

    // 1 WETH = 1769.02 USD
    expect(round($gallery->fresh()->value(CurrencyCode::USD)))->toBe(round(2.1 * 1769.02));
});

it('should calculate the gallery value if collection floor_price is null', function () {
    $weth = Token::factory()->wethWithPrices()->create();
    $collection = Collection::factory()->create([
        'floor_price' => null,
        'floor_price_token_id' => $weth->id,
    ]);
    $gallery = Gallery::factory()->create();
    $nft = Nft::factory()->create([
        'collection_id' => $collection->id,
    ]);

    $gallery->nfts()->attach($nft, ['order_index' => 0]);

    Gallery::updateValues([$gallery->id]);

    expect($gallery->fresh()->value(CurrencyCode::USD))->toBe(null);
});

it('should calculate the gallery value if only one collection floor_price is null', function () {
    $weth = Token::factory()->wethWithPrices()->create();
    $collection = Collection::factory()->create([
        'floor_price' => null,
        'floor_price_token_id' => $weth->id,
    ]);
    $collection2 = Collection::factory()->create([
        'floor_price' => 2.1 * 1e18,
        'floor_price_token_id' => $weth->id,
    ]);
    $gallery = Gallery::factory()->create();
    $nft = Nft::factory()->create([
        'collection_id' => $collection->id,
    ]);
    $nft2 = Nft::factory()->create([
        'collection_id' => $collection2->id,
    ]);

    $gallery->nfts()->attach($nft, ['order_index' => 0]);
    $gallery->nfts()->attach($nft2, ['order_index' => 2]);

    Gallery::updateValues([$gallery->id]);

    // 1 WETH = 1769.02 USD
    expect(round($gallery->fresh()->value(CurrencyCode::USD)))->toBe(round(2.1 * 1769.02));
});

it('should calculate the gallery value if token value is null', function () {
    $token = Token::factory()->create();
    $collection = Collection::factory()->create([
        'floor_price' => 2.1 * 1e18,
        'floor_price_token_id' => $token->id,
    ]);
    $gallery = Gallery::factory()->create();
    $nft = Nft::factory()->create([
        'collection_id' => $collection->id,
    ]);

    $gallery->nfts()->attach($nft, ['order_index' => 0]);

    Gallery::updateValues([$gallery->id]);

    expect($gallery->fresh()->value(CurrencyCode::USD))->toBe(null);
});

it('should get null for the total gallery value if no value found for the eth token', function () {
    Token::factory()->weth()->create();

    $gallery = Gallery::factory()->create();

    Gallery::updateValues([$gallery->id]);

    expect($gallery->fresh()->value(CurrencyCode::USD))->toBeNull();
});

it('should get the collections for a gallery', function () {
    $gallery = Gallery::factory()->create();
    $nft = Nft::factory()->create();

    $gallery->nfts()->attach($nft, ['order_index' => 0]);

    expect(count($gallery->collections()))->toBe(1);
    expect($gallery->collections()->get(0))->toEqual($nft->collection);
});

it('should get the counts for a gallery', function () {
    $nft = Nft::factory()->create();
    $gallery = Gallery::factory()->create();

    expect($gallery->nfts()->count())->toBe(0);

    $gallery->nfts()->attach($nft->id, ['order_index' => 1]);

    expect($gallery->nfts()->count())->toBe(1);

    expect($gallery->nftsCount())->toBe(1);
    expect($gallery->collectionsCount())->toBe(1);
});

it('can sort by popularity', function () {
    // 10 * 1 = 10
    $galleryWith10Views = Gallery::factory()
        ->afterCreating(fn ($gallery) => addViews($gallery, 10))
        ->create();

    // 3 * 10 = 30
    $galleryWith3Likes = Gallery::factory()
        ->hasLikes(3)
        ->create();

    // (2*1) + (3*10) = 32
    $galleryWith2ViewsAnd3Likes = Gallery::factory()
        ->afterCreating(fn ($gallery) => addViews($gallery, 2))
        ->hasLikes(3)
        ->create();

    // 0
    $galleryWithoutScore = Gallery::factory()->create();

    Gallery::updateScores();

    $sortedGalleries = Gallery::popular()->get();

    expect($sortedGalleries[0]->score)->toBe(32);
    expect($sortedGalleries[0]->id)->toBe($galleryWith2ViewsAnd3Likes->id);
    expect($sortedGalleries[1]->score)->toBe(30);
    expect($sortedGalleries[1]->id)->toBe($galleryWith3Likes->id);
    expect($sortedGalleries[2]->score)->toBe(10);
    expect($sortedGalleries[2]->id)->toBe($galleryWith10Views->id);
    expect($sortedGalleries[3]->score)->toBe(0);
    expect($sortedGalleries[3]->id)->toBe($galleryWithoutScore->id);
});

it('can sort by popularity with different scores', function () {
    Config::set('dashbrd.gallery.popularity_score', [
        'view' => 3,
        'like' => 2,
    ]);

    // 10 * 3 = 30
    Gallery::factory()
        ->afterCreating(fn ($gallery) => addViews($gallery, 10))
        ->create();

    // 3 * 2 = 6
    Gallery::factory()
        ->hasLikes(3)
        ->create();

    // (2*3) + (3*2) = 12
    Gallery::factory()
        ->afterCreating(fn ($gallery) => addViews($gallery, 2))
        ->hasLikes(3)
        ->create();

    // 0
    Gallery::factory()->create();

    Gallery::updateScores();

    $sortedGalleries = Gallery::popular()->get();

    expect($sortedGalleries[0]->score)->toBe(30);
    expect($sortedGalleries[1]->score)->toBe(12);
    expect($sortedGalleries[2]->score)->toBe(6);
    expect($sortedGalleries[3]->score)->toBe(0);
});

it('can sort by most valuable', function ($currency, $value) {
    $weth = Token::factory()->wethWithPrices()->create();

    $collectionExpensive = Collection::factory()->create([
        'floor_price' => 3.5 * 1e18,
        'floor_price_token_id' => $weth->id,
    ]);

    $collectionNormal = Collection::factory()->create([
        'floor_price' => 1.002 * 1e18,
        'floor_price_token_id' => $weth->id,
    ]);

    $collectionCheap = Collection::factory()->create([
        'floor_price' => 0.1 * 1e18,
        'floor_price_token_id' => $weth->id,
    ]);

    // Price: 1.002+0.1=1.102
    $gallery1 = Gallery::factory()->create();
    $gallery1->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionCheap->id])->id, ['order_index' => 1]);
    $gallery1->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionNormal->id])->id, ['order_index' => 2]);

    // Price: 3.5+3.5+0.1=7.1
    $gallery2 = Gallery::factory()->create();
    $gallery2->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionExpensive->id])->id, ['order_index' => 1]);
    $gallery2->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionCheap->id])->id, ['order_index' => 2]);
    $gallery2->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionExpensive->id])->id, ['order_index' => 3]);

    // Price: 1.002 * 3=3.006
    $gallery3 = Gallery::factory()->create();
    $gallery3->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionNormal->id])->id, ['order_index' => 1]);
    $gallery3->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionNormal->id])->id, ['order_index' => 2]);
    $gallery3->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionNormal->id])->id, ['order_index' => 3]);

    // Price 0
    $gallery4 = Gallery::factory()->create();

    // Price: 3.5
    $gallery5 = Gallery::factory()->create();
    $gallery5->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionExpensive->id])->id, ['order_index' => 1]);

    Gallery::updateValues();

    $sortedGalleries = Gallery::mostValuable($currency)->get();

    expect(round((float) $sortedGalleries[0]->value($currency), 2))->toEqual(round(7.1 * $value, 2));

    expect(round((float) $sortedGalleries[1]->value($currency), 2))->toEqual(round(3.5 * $value, 2));

    expect(round((float) $sortedGalleries[2]->value($currency), 2))->toEqual(round(3.006 * $value, 2));

    expect(round((float) $sortedGalleries[3]->value($currency), 2))->toEqual(round(1.102 * $value, 2));

    expect(round((float) $sortedGalleries[4]->value($currency), 2))->toEqual(round(0 * $value, 2));
})->with([
    [CurrencyCode::USD, 1769.02],
    [CurrencyCode::EUR, 1644.19],
    [CurrencyCode::MXN, 32655],
]);

it('determines if a gallery was reported recently by the user', function ($hoursAgo, $expected) {
    $reportTimestamp = now()->subHours($hoursAgo);

    $user = User::factory()->create();

    $gallery = Gallery::factory()->create();

    Report::factory()->create([
        'user_id' => $user->id,
        'subject_type' => Gallery::class,
        'subject_id' => $gallery->id,
        'created_at' => $reportTimestamp,
    ]);

    expect($gallery->wasReportedByUserRecently($user))->toBe($expected);
})->with([
    // @see `dashbrd.reports.throttle.gallery.same_gallery_per_hours` config
    [48, true],
    [47, true],
    [49, false],
    [0, true],
]);

it('can get reporting throttle duration', function () {
    $method = new \ReflectionMethod(Collection::class, 'reportingThrottleDuration');
    $method->setAccessible(true);

    expect($method->invoke(new Collection))->toBeInt();
});
