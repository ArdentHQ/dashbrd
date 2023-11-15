<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Nft;
use Illuminate\Support\Facades\Config;

it('should return collection and their NFTs for the given page', function () {
    Config::set('dashbrd.gallery.pagination.collections_per_page', 8);
    Config::set('dashbrd.gallery.pagination.nfts_per_page', 3);

    $user = createUser();

    $userCollections = Collection::factory()->count(12)->create();

    $userCollections->each(function (Collection $collection) use ($user) {
        Nft::factory()->count(2)->create([
            'wallet_id' => $user->wallet_id,
            'collection_id' => $collection->id,
        ]);
    });

    $firstCollection = $userCollections->first();

    $secondUser = createUser();

    $unownedNfts = Nft::factory()->count(2)->create([
        'wallet_id' => $secondUser->wallet_id,
        'collection_id' => $firstCollection->id,
    ]);

    // test page 1
    $response = $this->actingAs($user)
        ->getJson(route('my-galleries.collections'))
        ->assertStatus(200)
        ->assertJsonCount(2)
        ->json();

    expect(count($response['collections']['paginated']['data']))->toEqual(8)
        ->and(count($response['nfts']))->toEqual(16)
        ->and(array_column($response['nfts'], 'id'))->not()->toContain($unownedNfts->pluck('id'));

    // test page 2
    $response = $this->actingAs($user)
        ->getJson(route('my-galleries.collections', ['page' => 2]))
        ->assertStatus(200)
        ->assertJsonCount(2)
        ->json();

    expect(count($response['collections']['paginated']['data']))->toEqual(4)
        ->and(count($response['nfts']))->toEqual(8);

    // test page 3
    $response = $this->actingAs($user)
        ->getJson(route('my-galleries.collections', ['page' => 3]))
        ->assertStatus(200)
        ->assertJsonCount(2)
        ->json();

    expect(count($response['collections']['paginated']['data']))->toEqual(0)
        ->and(count($response['nfts']))->toEqual(0);
});

it('should return correct NFTs for the given page', function () {
    Config::set('dashbrd.gallery.pagination.collections_per_page', 8);
    Config::set('dashbrd.gallery.pagination.nfts_per_page', 3);

    $user = createUser();

    $userCollection = Collection::factory()->create();

    $nfts = Nft::factory()->count(5)->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    $secondUser = createUser();

    Nft::factory()->count(2)->create([
        'wallet_id' => $secondUser->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    $collectionsResponse = $this->actingAs($user)
        ->getJson(route('my-galleries.collections'))
        ->assertStatus(200)
        ->json();

    $firstCallNfts = $collectionsResponse['nfts'];

    $nftsResponse = $this->actingAs($user)
        ->getJson(route('my-galleries.nfts', ['collection' => $userCollection, 'page' => 2]))
        ->assertStatus(200)
        ->assertJsonCount(1)
        ->json();

    $secondCallNfts = $nftsResponse['nfts'];

    $pulledNfts = collect([...$firstCallNfts, ...$secondCallNfts])->pluck('id');

    expect($pulledNfts)->toEqual($nfts->pluck('id'));
});


it("should return hidden collections if 'showHidden' is true", function () {
    Config::set('dashbrd.gallery.pagination.collections_per_page', 8);
    Config::set('dashbrd.gallery.pagination.nfts_per_page', 3);

    $user = createUser();

    $userCollections = Collection::factory()->count(12)->create();

    $userCollections->each(function (Collection $collection) use ($user) {
        Nft::factory()->count(2)->create([
            'wallet_id' => $user->wallet_id,
            'collection_id' => $collection->id,
        ]);
    });

    $firstCollection = $userCollections->first();

    $secondUser = createUser();

    $unownedNfts = Nft::factory()->count(2)->create([
        'wallet_id' => $secondUser->wallet_id,
        'collection_id' => $firstCollection->id,
    ]);

    $response = $this->actingAs($user)
        ->getJson(route('my-galleries.collections', ['showHidden' => 'true']))
        ->assertStatus(200)
        ->assertJsonCount(2)
        ->json();

    expect(count($response['collections']['paginated']['data']))->toEqual(0)
        ->and(count($response['nfts']))->toEqual(0);
});
