<?php

declare(strict_types=1);

use App\Enums\TraitDisplayType;
use App\Jobs\FetchCollectionBanner;
use App\Jobs\SyncCollection;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;
use App\Models\Token;
use Carbon\Carbon;
use Illuminate\Support\Facades\Bus;
use Inertia\Testing\AssertableInertia as Assert;

it('can render the collections overview page', function () {
    $user = createUser();

    $this->actingAs($user)
        ->get(route('collections'))
        ->assertStatus(200);
});

it('can render the collections for guests', function () {
    $this->get(route('collections'))
        ->assertStatus(200);
});

it('should render collections overview page with collections and NFTs', function () {
    $user = createUser();

    $secondaryUser = createUser();

    $collection = Collection::factory()->create();

    collect([$secondaryUser->wallet_id, $user->wallet_id, $user->wallet_id])
        ->map(fn ($walletId) => Nft::factory()->create(['wallet_id' => $walletId, 'collection_id' => $collection->id]));

    $response = $this->actingAs($user)
        ->getJson(route('collections'))
        ->assertStatus(200)
        ->assertJsonCount(7)
        ->json();

    expect(count($response['collections']['data']))->toEqual(1);
});

it('can render the collections view page', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'last_viewed_at' => null,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', $collection->slug))
        ->assertStatus(200);

    expect($collection->fresh()->last_viewed_at)->not->toBeNull();

    Bus::assertDispatched(SyncCollection::class);
});

it('should run FetchCollectionBanner if collection has no banner', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'extra_attributes' => [
            'banner' => null,
        ],
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', $collection->slug))
        ->assertStatus(200);

    Bus::assertDispatched(FetchCollectionBanner::class);
});

it('should run FetchCollectionBanner if colleciton banner was updated more than a week ago', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'extra_attributes' => [
            'banner' => 'https://example.com/image.png',
            'banner_updated_at' => now()->subWeek()->subDay()->toDateTimeString(),
        ],
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', $collection->slug))
        ->assertStatus(200);

    Bus::assertDispatched(FetchCollectionBanner::class);
});

it('should run FetchCollectionBanner if collection has banner but no banner_updated_at set', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'extra_attributes' => [
            'banner' => 'https://example.com/image.png',
        ],
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', $collection->slug))
        ->assertStatus(200);

    Bus::assertDispatched(FetchCollectionBanner::class);
});

it('should not run FetchCollectionBanner if collection has banner and banner_updated_at set', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'extra_attributes' => [
            'banner' => 'https://example.com/image.png',
            'banner_updated_at' => Carbon::now(),
        ],
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', $collection->slug))
        ->assertStatus(200);

    Bus::assertNotDispatched(FetchCollectionBanner::class);
});

it('can render the collection details page for guests', function () {
    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'last_viewed_at' => null,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->get(route('collections.view', $collection->slug))
        ->assertStatus(200);
});

it('does not dispatch the job to sync collection if it has been recently viewed', function () {
    $user = createUser();

    $network = Network::polygon();

    Bus::fake();

    $now = now()->subMinutes(5);

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'last_viewed_at' => $now,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', $collection->slug))
        ->assertStatus(200);

    // Time is newer than $now..
    expect($collection->fresh()->last_viewed_at->gte($now))->toBeTrue();

    Bus::assertNotDispatched(SyncCollection::class);
});

it('can render the collections view page with owned filter', function ($owned) {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'owned' => $owned,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', $owned !== null)
                        ->where('traits', null)
                        ->where('tab', 'collection')
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)

                )
        );
})->with([
    null,
    true,
    1,
]);

it('can render the collections view page with falsy owned filter', function ($owned) {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Nft::factory()->create([
        'collection_id' => $collection->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'owned' => $owned,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('traits', null)
                        ->where('tab', 'collection')
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)
                )
        );
})->with([
    false,
    0,
]);

it('can render the collections view page with custom nftPageLimit', function () {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'nftPageLimit' => 48,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('tab', 'collection')
                        ->where('traits', null)
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 48)
                )
        );
});

it('can render the collections view page with traits', function () {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $traits = [
        'Background' => [
            ['value' => 'Red', 'displayType' => TraitDisplayType::Property->value],
            ['value' => 'Blue', 'displayType' => TraitDisplayType::Property->value],
        ],
        'Body' => [
            ['value' => 'Brown', 'displayType' => TraitDisplayType::Property->value],
            ['value' => 'Blue', 'displayType' => TraitDisplayType::Property->value],
        ],
    ];

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'traits' => $traits,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('traits', $traits)
                        ->where('tab', 'collection')
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)
                )
        );
});

it('can render the collections view page with activity tab', function () {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'tab' => 'activity',
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('tab', 'activity')
                        ->where('traits', null)
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)
                )
        );
});

it('can render the collections view page with custom activityPageLimit', function () {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'tab' => 'activity',
            'activityPageLimit' => 25,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('tab', 'activity')
                        ->where('traits', null)
                        ->where('activityPageLimit', 25)
                        ->where('nftPageLimit', 24)
                )
        );
});

it('can render the collections view page with max activityPageLimit of 100', function () {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'tab' => 'activity',
            'activityPageLimit' => 300,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('tab', 'activity')
                        ->where('traits', null)
                        ->where('activityPageLimit', 100)
                        ->where('nftPageLimit', 24)
                )
        );
});

it('uses collection tab if another parameter is passed', function () {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'tab' => 'other',
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('traits', null)
                        ->where('tab', 'collection')
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)
                )
        );
});

it('can render the collections view page with invalid traits', function ($invalidTraits) {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'traits' => $invalidTraits,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('traits', null)
                        ->where('tab', 'collection')
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)
                )
        );
})->with([
    // Invalid boolean
    true,
    // Invalid array format
    [
        'Background' => 'Red',
        'Body' => 'Brown',
    ],
    [
        'Background' => ['value' => 'Red', 'displayType' => 'asdf'],
    ],
    [
        1 => ['value' => 'Red', 'displayType' => TraitDisplayType::Property->value],
    ],
    null,
]);

it('can render the collections view page with empty traits', function () {
    $user = createUser();
    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'traits' => [],
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('traits', null)
                        ->where('tab', 'collection')
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)
                )
        );
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
        ->get(route('collections', ['query' => 'Test']))
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
        ->getJson(route('collections', ['query' => 'Test']))
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
        ->get(route('collections', [
            'other' => 'param',
            'showHidden' => 'true',
        ]))
        ->assertRedirectToRoute('collections', [
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
        ->getJson(route('collections', [
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
        ->getJson(route('collections', ['sort' => 'oldest']))
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
        ->getJson(route('collections', ['sort' => 'received']))
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
        ->getJson(route('collections', ['sort' => 'name', 'direction' => 'desc']))
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
        ->getJson(route('collections', ['sort' => 'floor-price']))
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
        ->getJson(route('collections', ['sort' => 'chain']))
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
        ->getJson(route('collections', ['sort' => 'value']))
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
        ->getJson(route('collections', [
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
        ->get(route('collections'))
        ->assertInertia(function ($page) {
            $stats = $page->toArray()['props']['initialStats'];

            return $stats['nfts'] === 2 && $stats['collections'] === 2;
        });

    $this->actingAs($user)
        ->get(route('collections', ['showHidden' => 'true']))
        ->assertInertia(function ($page) {
            $stats = $page->toArray()['props']['initialStats'];

            return $stats['nfts'] === 1 && $stats['collections'] === 1;
        });

    $response = $this->actingAs($user)->getJson(route('collections'));

    expect($response['stats']['nfts'] === 2 && $response['stats']['collections'] === 2)->toBeTrue();

    $response = $this->actingAs($user)->getJson(route('collections', [
        'showHidden' => 'true',
    ]));

    expect($response['stats']['nfts'] === 1 && $response['stats']['collections'] === 1)->toBeTrue();
});
