<?php

declare(strict_types=1);

use App\Enums\TraitDisplayType;
use App\Jobs\FetchCollectionBanner;
use App\Jobs\SyncCollection;
use App\Models\Article;
use App\Models\Collection;
use App\Models\CollectionTrait;
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
        ->assertJsonCount(8)
        ->json();

    expect(count($response['collections']['data']))->toEqual(1);
    expect(count($response['nfts']))->toEqual(2);
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

it('should render user owned NFTs first ', function ($owned) {
    $user = createUser();

    $secondaryUser = createUser();

    $network = Network::polygon();

    $userCollection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $nfts = collect([
        $secondaryUser->wallet_id,
        $user->wallet_id,
        $user->wallet_id,
    ])->map(function ($walletId) use ($userCollection) {
        return Nft::factory()->create([
            'wallet_id' => $walletId,
            'collection_id' => $userCollection->id,
        ]);
    });

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $userCollection,
            'owned' => $owned,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'nfts.paginated.data.2',
                    fn (Assert $page) => $page
                        ->where('id', $nfts[0]->id)
                        ->etc()
                )
        );
})->with([
    false,
]);

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
        ->assertJsonCount(8);
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
        ->assertJsonCount(8);
});

it('returns nfts with traits', function () {
    $user = createUser();

    $userCollection = Collection::factory()->create([
        'name' => 'Test Collection',
    ]);

    $nft = Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    [$stringTrait, $numericTrait, $dateTrait] = CollectionTrait::factory()->createMany([
        [
            'collection_id' => $userCollection->id,
            'display_type' => TraitDisplayType::Property->value,
            'name' => 'Some String',
            'value_min' => null,
            'value_max' => null,
        ],
        [
            'collection_id' => $userCollection->id,
            'display_type' => TraitDisplayType::Stat->value,
            'name' => 'Some Stat',
            'value_min' => 1,
            'value_max' => 16,
        ],
        [
            'collection_id' => $userCollection->id,
            'display_type' => TraitDisplayType::Date->value,
            'name' => 'Some Date',
            'value_min' => null,
            'value_max' => null,
        ],
    ]);
    $nft->traits()->attach($stringTrait, ['value_string' => 'hello']);
    $nft->traits()->attach($numericTrait, ['value_numeric' => '15']);
    $nft->traits()->attach($dateTrait, ['value_date' => '2022-12-01']);

    $response = $this->actingAs($user)
        ->getJson(route('collections'))
        ->assertStatus(200)
        ->assertJsonCount(8)
        ->json();

    expect($response['nfts'][0]['traits'])->toEqual([
        [
            'displayType' => TraitDisplayType::Property->value,
            'value' => 'hello',
            'name' => 'Some String',
            'valueMin' => null,
            'valueMax' => null,
            'nftsCount' => $stringTrait['nfts_count'],
            'nftsPercentage' => $stringTrait['nfts_percentage'],
        ],
        [
            'displayType' => $numericTrait['display_type'],
            'value' => '15',
            'name' => 'Some Stat',
            'valueMin' => '1',
            'valueMax' => '16',
            'nftsCount' => $numericTrait['nfts_count'],
            'nftsPercentage' => $numericTrait['nfts_percentage'],
        ],
        [
            'displayType' => $dateTrait['display_type'],
            'value' => '2022-12-01 00:00:00',
            'name' => 'Some Date',
            'valueMin' => null,
            'valueMax' => null,
            'nftsCount' => $dateTrait['nfts_count'],
            'nftsPercentage' => $dateTrait['nfts_percentage'],
        ],
    ]);
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
        ->assertJsonCount(8);
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
        ->assertJsonCount(8);
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
        ->assertJsonCount(8);
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
        ->assertJsonCount(8);
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
        ->assertJsonCount(8);
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
        ->assertJsonCount(8);
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
        ->assertJsonCount(8)
        ->json();

    expect(count($response['selectedChainIds']))->toEqual(0);
    expect(count($response['nfts']))->toEqual(2);
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

it('should return collection articles', function () {
    $collections = Collection::factory(8)->create();

    $articles = Article::factory(2)->create([
        'published_at' => now()->format('Y-m-d'),
    ]);

    $articles->map(fn ($article) => $article
        ->addMedia('database/seeders/fixtures/articles/images/discovery-of-the-day-luchadores.png')
        ->preservingOriginal()
        ->toMediaCollection()
    );

    $collections->map(function ($collection) use ($articles) {
        $collection->articles()->attach($articles, ['order_index' => 1]);
    });

    $collection = $collections->first();

    $response = $this->getJson(route('collections.articles', $collection))->json('articles');

    expect(count($response['paginated']['data']))->toEqual(2)
        ->and(count($response['paginated']['data'][0]['featuredCollections']))->toEqual(7);
});

it('should return collection articles with the given pageLimit', function ($pageLimit, $resultCount) {
    $collections = Collection::factory(2)->create();

    $articles = Article::factory(35)->create([
        'published_at' => now()->format('Y-m-d'),
    ]);

    $articles->map(fn ($article) => $article
        ->addMedia('database/seeders/fixtures/articles/images/discovery-of-the-day-luchadores.png')
        ->preservingOriginal()
        ->toMediaCollection()
    );

    $collections->map(function ($collection) use ($articles) {
        $collection->articles()->attach($articles, ['order_index' => 1]);
    });

    $response = $this->getJson(route('collections.articles', [
        'collection' => $collections->first(),
        'pageLimit' => $pageLimit,
    ]))->json('articles');

    expect(count($response['paginated']['data']))->toEqual($resultCount);
})->with([
    [123, 35],
    [12, 12],
    [24, 24],
]);
it('should return published collection articles', function () {
    $collection = Collection::factory()->create();

    $articles = Article::factory(3)->create([
        'published_at' => now()->format('Y-m-d'),
    ]);

    $unpublishedArticle = Article::factory()->create([
        'published_at' => null,
    ]);

    $articles->push($unpublishedArticle);

    attachImageToArticles($articles);

    $collection->articles()->attach($articles, ['order_index' => 1]);

    $response = $this->getJson(route('collections.articles', $collection))->json('articles');

    expect(count($response['paginated']['data']))->toEqual(3)
        ->and(array_column($response['paginated']['data'], 'id'))->not()->toContain($unpublishedArticle->id);
});

it('should get collection articles sorted: popularity', function () {
    $collection = Collection::factory()->create();

    $article1 = Article::factory()->create([
        'published_at' => now()->format('Y-m-d'),
        'views_count' => 1,
    ]);

    $article2 = Article::factory()->create([
        'published_at' => now()->format('Y-m-d'),
        'views_count' => 3,
    ]);

    $collection->articles()->attach($article1, ['order_index' => 1]);
    $collection->articles()->attach($article2, ['order_index' => 1]);

    attachImageToArticles(collect([$article2, $article1]));

    $response = $this->getJson(
        route('collections.articles', [
            'collection' => $collection,
            'sort' => 'popularity',
        ])
    )->json('articles');

    $returnedArticles = $response['paginated']['data'];

    expect($returnedArticles[0]['id'])->toBe($article2->id)
        ->and($returnedArticles[1]['id'])->toBe($article1->id);
});

it('should get collection articles sorted: latest', function () {
    $collection = Collection::factory()->create();

    $article1 = Article::factory()->create([
        'published_at' => now()->format('Y-m-d'),
    ]);

    $article2 = Article::factory()->create([
        'published_at' => now()->format('Y-m-d'),
    ]);

    $collection->articles()->attach($article1, ['order_index' => 1]);
    $collection->articles()->attach($article2, ['order_index' => 1]);

    attachImageToArticles(collect([$article2, $article1]));

    $response = $this->getJson(route('collections.articles', $collection))->json('articles');

    $returnedArticles = $response['paginated']['data'];

    expect($returnedArticles[0]['id'])->toBe($article2->id)
        ->and($returnedArticles[1]['id'])->toBe($article1->id);
});




function attachImageToArticles($articles)
{
    $articles->map(fn ($article) => $article
        ->addMedia('database/seeders/fixtures/articles/images/discovery-of-the-day-luchadores.png')
        ->preservingOriginal()
        ->toMediaCollection()
    );
}
