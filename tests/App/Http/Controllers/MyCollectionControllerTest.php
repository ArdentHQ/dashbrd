<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;

it('can render the my collections overview page', function () {
    $user = createUser();

    $this->actingAs($user)
        ->get(route('my-collections'))
        ->assertStatus(200);
});

it('can render the collections for guests', function () {
    $this->get(route('my-collections'))
        ->assertStatus(200);
});

it('should render collections overview page with collections and NFTs', function () {
    $user = createUser();

    $secondaryUser = createUser();

    $collection = Collection::factory()->create();

    collect([$secondaryUser->wallet_id, $user->wallet_id, $user->wallet_id])
        ->map(fn ($walletId) => Nft::factory()->create(['wallet_id' => $walletId, 'collection_id' => $collection->id]));

    $response = $this->actingAs($user)
        ->getJson(route('my-collections'))
        ->assertStatus(200)
        ->assertJsonCount(7)
        ->json();

    expect(count($response['collections']['data']))->toEqual(1);
});

it('filters the collections by a search query', function () {
    $user = createUser();

    $userCollection = Collection::factory()->create([
        'name' => 'Test Collection',
    ]);

    $userCollection2 = Collection::factory()->create([
        'name' => 'Another Collection',
    ]);

    $userCollection3 = Collection::factory()->create([
        'name' => 'Test Collection 2',
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection2->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection3->id,
    ]);

    $this->actingAs($user)
        ->get(route('my-collections', ['query' => 'Test']))
        ->assertStatus(200);
});

it('filters the collections by a search query on json requests', function () {
    $user = createUser();

    $userCollection = Collection::factory()->create([
        'name' => 'Test Collection',
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    $this->actingAs($user)
        ->getJson(route('my-collections', ['query' => 'Test']))
        ->assertStatus(200)
        ->assertJsonCount(7);
});

it('removes the showIndex parameter if user has no hidden collections', function () {
    $user = createUser();

    $userCollection = Collection::factory()->create([
        'name' => 'Test Collection',
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    $this->actingAs($user)
        ->get(route('my-collections', [
            'other' => 'param',
            'showHidden' => 'true',
        ]))
        ->assertRedirectToroute('my-collections', [
            'other' => 'param',
        ]);
});

it('filters hidden collections by a search query on json requests', function () {
    $user = createUser();

    $userCollection = Collection::factory()->create([
        'name' => 'Test Collection',
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    $hiddenCollection = Collection::factory()->create();
    $user->hiddenCollections()->attach($hiddenCollection);

    $this->actingAs($user)
        ->getJson(route('my-collections', [
            'query' => 'Test',
            'showHidden' => 'true',
        ]))
        ->assertStatus(200)
        ->assertJsonCount(7);
});

it('can sort by oldest collection', function () {
    $user = createUser();

    $userCollection = Collection::factory()->create([
        'name' => 'Test Collection',
    ]);

    $userCollection2 = Collection::factory()->create([
        'name' => 'Another Collection',
    ]);

    $userCollection3 = Collection::factory()->create([
        'name' => 'Test Collection 2',
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection2->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection3->id,
    ]);

    $this->actingAs($user)
        ->getJson(route('my-collections', ['sort' => 'oldest']))
        ->assertStatus(200)
        ->assertJsonCount(7);
});

it('can sort by recently received', function () {
    $user = createUser();

    $userCollection = Collection::factory()->create([
        'name' => 'Test Collection',
    ]);

    $userCollection2 = Collection::factory()->create([
        'name' => 'Another Collection',
    ]);

    $userCollection3 = Collection::factory()->create([
        'name' => 'Test Collection 2',
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection2->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection3->id,
    ]);

    $this->actingAs($user)
        ->getJson(route('my-collections', ['sort' => 'received']))
        ->assertStatus(200)
        ->assertJsonCount(7);
});

it('can sort by collection name', function () {
    $user = createUser();

    $userCollection = Collection::factory()->create([
        'name' => 'A',
    ]);

    $userCollection2 = Collection::factory()->create([
        'name' => 'B',
    ]);

    $userCollection3 = Collection::factory()->create([
        'name' => 'C',
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection2->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection3->id,
    ]);

    $this->actingAs($user)
        ->getJson(route('my-collections', ['sort' => 'name', 'direction' => 'desc']))
        ->assertStatus(200)
        ->assertJsonCount(7);
});

it('can sort by floor price', function () {
    $user = createUser();

    $userCollection = Collection::factory()->create([
        'name' => 'A',
    ]);

    $userCollection2 = Collection::factory()->create([
        'name' => 'B',
    ]);

    $userCollection3 = Collection::factory()->create([
        'name' => 'C',
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection2->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection3->id,
    ]);

    $this->actingAs($user)
        ->getJson(route('my-collections', ['sort' => 'floor-price']))
        ->assertStatus(200)
        ->assertJsonCount(7);
});

it('can sort by chain ID', function () {
    $user = createUser();

    $userCollection = Collection::factory()->create([
        'name' => 'A',
    ]);

    $userCollection2 = Collection::factory()->create([
        'name' => 'B',
    ]);

    $userCollection3 = Collection::factory()->create([
        'name' => 'C',
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection2->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection3->id,
    ]);

    $this->actingAs($user)
        ->getJson(route('my-collections', ['sort' => 'chain']))
        ->assertStatus(200)
        ->assertJsonCount(7);
});

it('can sort by value', function () {
    $user = createUser();

    $userCollection = Collection::factory()->create([
        'name' => 'A',
    ]);

    $userCollection2 = Collection::factory()->create([
        'name' => 'B',
    ]);

    $userCollection3 = Collection::factory()->create([
        'name' => 'C',
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection2->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection3->id,
    ]);

    $this->actingAs($user)
        ->getJson(route('my-collections', ['sort' => 'value']))
        ->assertStatus(200)
        ->assertJsonCount(7);
});

it('should remove selected chains where its network has no collections in its count', function () {
    $user = createUser();
    $network1 = Network::factory()->create();
    $network2 = Network::factory()->create();

    $collection1 = Collection::factory()->create(['network_id' => $network1->id]);
    $collection2 = Collection::factory()->create(['network_id' => $network2->id]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $collection1->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $collection2->id,
    ]);

    $response = $this->actingAs($user)
        ->getJson(route('my-collections', [
            'chain' => '137',
        ]))
        ->assertStatus(200)
        ->assertJsonCount(7)
        ->json();

    expect(count($response['selectedChainIds']))->toEqual(0);
});

it('can get stats', function () {
    $user = createUser();

    $collection1 = Collection::factory()->create();
    Nft::factory()->for($collection1)->for($user->wallet)->create();

    $collection2 = Collection::factory()->create();
    Nft::factory()->for($collection2)->for($user->wallet)->create();

    $hidden = Collection::factory()->create();
    Nft::factory()->for($hidden)->for($user->wallet)->create();

    $user->hiddenCollections()->attach($hidden);

    $this->actingAs($user)
        ->get(route('my-collections'))
        ->assertInertia(function ($page) {
            $stats = $page->toArray()['props']['initialStats'];

            return $stats['nfts'] === 2 && $stats['collections'] === 2;
        });

    $this->actingAs($user)
        ->get(route('my-collections', ['showHidden' => 'true']))
        ->assertInertia(function ($page) {
            $stats = $page->toArray()['props']['initialStats'];

            return $stats['nfts'] === 1 && $stats['collections'] === 1;
        });

    $response = $this->actingAs($user)->getJson(route('my-collections'));

    expect($response['stats']['nfts'] === 2 && $response['stats']['collections'] === 2)->toBeTrue();

    $response = $this->actingAs($user)->getJson(route('my-collections', [
        'showHidden' => 'true',
    ]));

    expect($response['stats']['nfts'] === 1 && $response['stats']['collections'] === 1)->toBeTrue();
});
