<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Gallery;
use App\Models\Nft;
use App\Models\User;
use App\Models\Wallet;
use App\Support\Cache\UserCache;

it('gets the nftsCount from the model', function () {
    $user = User::factory()->create();

    $userCache = new UserCache($user);

    expect($userCache->nftsCount())->toBe(0);
});

it('gets the nftsCount from cache', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    Nft::factory()->create(['wallet_id' => $wallet->id]);

    $userCache = new UserCache($user);

    expect($userCache->nftsCount())->toBe(1);

    Nft::factory()->create(['wallet_id' => $wallet->id]);

    $user->refresh();

    expect($userCache->nftsCount())->toBe(1);
});

it('gets the hidden NFTs count from the model', function () {
    $user = User::factory()->create();

    $userCache = new UserCache($user);

    expect($userCache->hiddenNftsCount())->toBe(0);
});

it('gets the hidden NFTs count from cache', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    $nft = Nft::factory()->create(['wallet_id' => $wallet->id]);

    $user->hiddenCollections()->attach($nft->collection);

    $userCache = new UserCache($user);

    expect($userCache->hiddenNftsCount())->toBe(1);

    $nft = Nft::factory()->create(['wallet_id' => $wallet->id]);

    $user->hiddenCollections()->attach($nft->collection);

    $user->refresh();

    expect($userCache->hiddenNftsCount())->toBe(1);
});

it('gets the shown NFTs count from the model', function () {
    $user = User::factory()->create();

    $userCache = new UserCache($user);

    expect($userCache->shownNftsCount())->toBe(0);
});

it('gets the shown NFTs count from cache', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    Nft::factory()->create(['wallet_id' => $wallet->id]);

    $userCache = new UserCache($user);

    expect($userCache->shownNftsCount())->toBe(1);

    Nft::factory()->create(['wallet_id' => $wallet->id]);

    $user->refresh();

    expect($userCache->shownNftsCount())->toBe(1);
});

it('clears the nftsCount cache', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    Nft::factory()->create(['wallet_id' => $wallet->id]);

    $nft = Nft::factory()->create(['wallet_id' => $wallet->id]);
    $user->hiddenCollections()->attach($nft->collection);

    $userCache = new UserCache($user);

    expect($userCache->nftsCount())->toBe(2);
    expect($userCache->hiddenNftsCount())->toBe(1);
    expect($userCache->shownNftsCount())->toBe(1);

    $nft = Nft::factory()->create(['wallet_id' => $wallet->id]);
    $user->hiddenCollections()->attach($nft->collection);

    $user->refresh();

    expect($userCache->nftsCount())->toBe(2);
    expect($userCache->hiddenNftsCount())->toBe(1);
    expect($userCache->shownNftsCount())->toBe(1);

    $userCache->clearNftsCount();

    expect($userCache->nftsCount())->toBe(3);
    expect($userCache->hiddenNftsCount())->toBe(2);
    expect($userCache->shownNftsCount())->toBe(1);
});

it('gets the collectionsCount from the model', function () {
    $user = User::factory()->create();

    $userCache = new UserCache($user);

    expect($userCache->collectionsCount())->toBe(0);
});

it('gets the collectionsCount from cache', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    Nft::factory(4)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => Collection::factory()->create()->id,
    ]);

    $userCache = new UserCache($user);

    expect($userCache->collectionsCount())->toBe(1);

    Nft::factory()->create([
        'wallet_id' => $wallet->id,
        'collection_id' => Collection::factory()->create()->id,
    ]);

    $user->refresh();

    expect($userCache->collectionsCount())->toBe(1);
});

it('gets the hidden collectionsCount from the model', function () {
    $user = User::factory()->create();

    $userCache = new UserCache($user);

    expect($userCache->hiddenCollectionsCount())->toBe(0);
});

it('gets the hidden collectionsCount from cache', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    $collection = Collection::factory()->create();
    Nft::factory(4)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => $collection->id,
    ]);

    $user->hiddenCollections()->attach($collection);

    $userCache = new UserCache($user);

    expect($userCache->hiddenCollectionsCount())->toBe(1);

    $nft = Nft::factory()->create([
        'wallet_id' => $wallet->id,
        'collection_id' => Collection::factory()->create()->id,
    ]);

    $user->hiddenCollections()->attach($nft->collection);

    $user->refresh();

    expect($userCache->hiddenCollectionsCount())->toBe(1);
});

it('gets the shown collectionsCount from the model', function () {
    $user = User::factory()->create();

    $userCache = new UserCache($user);

    expect($userCache->shownCollectionsCount())->toBe(0);
});

it('gets the shown collectionsCount from cache', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    $collection = Collection::factory()->create();
    Nft::factory(4)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => $collection->id,
    ]);

    $userCache = new UserCache($user);

    expect($userCache->shownCollectionsCount())->toBe(1);

    $nft = Nft::factory()->create([
        'wallet_id' => $wallet->id,
        'collection_id' => Collection::factory()->create()->id,
    ]);

    $user->refresh();

    expect($userCache->shownCollectionsCount())->toBe(1);
});

it('clears the collectionsCount cache', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    Nft::factory(4)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => Collection::factory()->create()->id,
    ]);

    $userCache = new UserCache($user);

    expect($userCache->collectionsCount())->toBe(1);

    Nft::factory()->create([
        'wallet_id' => $wallet->id,
        'collection_id' => Collection::factory()->create()->id,
    ]);

    $user->refresh();

    expect($userCache->collectionsCount())->toBe(1);

    $userCache->clearCollectionsCount();

    expect($userCache->collectionsCount())->toBe(2);
});

it('gets the galleriesCount from the model', function () {
    $user = User::factory()->create();

    $userCache = new UserCache($user);

    expect($userCache->galleriesCount())->toBe(0);
});

it('gets the galleriesCount from cache', function () {
    $user = User::factory()->create();
    Gallery::factory()->create(['user_id' => $user->id]);

    $userCache = new UserCache($user);

    expect($userCache->galleriesCount())->toBe(1);

    Gallery::factory()->create(['user_id' => $user->id]);

    $user->refresh();

    expect($userCache->galleriesCount())->toBe(1);
});

it('clears the galleriesCount cache', function () {
    $user = User::factory()->create();
    Gallery::factory()->create(['user_id' => $user->id]);

    $userCache = new UserCache($user);

    expect($userCache->galleriesCount())->toBe(1);

    Gallery::factory()->create(['user_id' => $user->id]);

    $user->refresh();

    expect($userCache->galleriesCount())->toBe(1);

    $userCache->clearGalleriesCount();

    expect($userCache->galleriesCount())->toBe(2);
});

it('gets the user detail nfts from the model', function () {
    $user = User::factory()->create();

    $userCache = new UserCache($user);

    expect($userCache->userDetailNfts()->count())->toBe(0);
});

it('gets the user detail nfts from cache', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    Nft::factory()->create(['wallet_id' => $wallet->id]);

    $userCache = new UserCache($user);

    expect($userCache->userDetailNfts()->count())->toBe(1);

    Nft::factory()->create(['wallet_id' => $wallet->id]);

    $user->refresh();

    expect($userCache->userDetailNfts()->count())->toBe(1);
});

it('clears the user detail nfts cache', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    Nft::factory()->create(['wallet_id' => $wallet->id]);

    $userCache = new UserCache($user);

    expect($userCache->userDetailNfts()->count())->toBe(1);

    Nft::factory()->create(['wallet_id' => $wallet->id]);

    $user->refresh();

    expect($userCache->userDetailNfts()->count())->toBe(1);

    $userCache->clearUserDetailNfts();

    expect($userCache->userDetailNfts()->count())->toBe(2);
});
