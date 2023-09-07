<?php

declare(strict_types=1);

use App\Enums\TraitDisplayType;
use App\Jobs\SyncCollection;
use App\Models\Collection;
use App\Models\CollectionTrait;
use App\Models\Network;
use App\Models\Nft;
use App\Models\Token;
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
        ->assertJsonCount(5)
        ->json();

    expect(count($response['collections']['data']))->toEqual(1);
    expect(count($response['nfts']))->toEqual(2);
});

it('can render the collections view page', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon()->firstOrFail();

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

it('does not dispatch the job to sync collection if it has been recently viewed', function () {
    $user = createUser();

    $network = Network::polygon()->firstOrFail();

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

    $network = Network::polygon()->firstOrFail();

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
        ->assertInertia(fn (Assert $page) => $page
            ->component('Collections/View')
            ->has('nfts.paginated.data.2', fn (Assert $page) => $page
                ->where('id', $nfts[0]->id)
                ->etc()
            )
        );
})->with([
    false,
]);

it('can render the collections view page with owned filter', function ($owned) {
    $user = createUser();

    $network = Network::polygon()->firstOrFail();

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
        ->assertInertia(fn (Assert $page) => $page
            ->component('Collections/View')
            ->has('appliedFilters', fn (Assert $page) => $page->where('owned', true)
                ->where('traits', null)
                ->where('tab', 'collection')
                ->where('pageLimit', 10)

            )
        );
})->with([
    null,
    true,
    1,
]);

it('can render the collections view page with falsy owned filter', function ($owned) {
    $user = createUser();

    $network = Network::polygon()->firstOrFail();

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
        ->assertInertia(fn (Assert $page) => $page
            ->component('Collections/View')
            ->has('appliedFilters', fn (Assert $page) => $page->where('owned', false)
                ->where('traits', null)
                ->where('tab', 'collection')
                ->where('pageLimit', 10)
            )
        );
})->with([
    false,
    0,
]);

it('can render the collections view page with traits', function () {
    $user = createUser();

    $network = Network::polygon()->firstOrFail();

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
        ->assertInertia(fn (Assert $page) => $page
            ->component('Collections/View')
            ->has('appliedFilters', fn (Assert $page) => $page->where('owned', true)
                ->where('traits', $traits)
                ->where('tab', 'collection')
                ->where('pageLimit', 10)
            )
        );
});

it('can render the collections view page with activity tab', function () {
    $user = createUser();

    $network = Network::polygon()->firstOrFail();

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
        ->assertInertia(fn (Assert $page) => $page
            ->component('Collections/View')
            ->has('appliedFilters', fn (Assert $page) => $page->where('owned', true)
                ->where('tab', 'activity')
                ->where('traits', null)
                ->where('pageLimit', 10)
            )
        );
});

it('can render the collections view page with custom pageLimit', function () {
    $user = createUser();

    $network = Network::polygon()->firstOrFail();

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
            'pageLimit' => 25,
        ]))
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Collections/View')
            ->has('appliedFilters', fn (Assert $page) => $page->where('owned', true)
                ->where('tab', 'activity')
                ->where('traits', null)
                ->where('pageLimit', 25)
            )
        );
});

it('can render the collections view page with max pageLimit of 100', function () {
    $user = createUser();

    $network = Network::polygon()->firstOrFail();

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
            'pageLimit' => 300,
        ]))
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Collections/View')
            ->has('appliedFilters', fn (Assert $page) => $page->where('owned', true)
                ->where('tab', 'activity')
                ->where('traits', null)
                ->where('pageLimit', 100)
            )
        );
});

it('uses collection tab if another parameter is passed', function () {
    $user = createUser();

    $network = Network::polygon()->firstOrFail();

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
        ->assertInertia(fn (Assert $page) => $page
            ->component('Collections/View')
            ->has('appliedFilters', fn (Assert $page) => $page->where('owned', true)
                ->where('traits', null)
                ->where('tab', 'collection')
                ->where('pageLimit', 10)
            )
        );
});

it('can render the collections view page with invalid traits', function ($invalidTraits) {
    $user = createUser();

    $network = Network::polygon()->firstOrFail();

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
        ->assertInertia(fn (Assert $page) => $page
            ->component('Collections/View')
            ->has('appliedFilters', fn (Assert $page) => $page->where('owned', true)
                ->where('traits', null)
                ->where('tab', 'collection')
                ->where('pageLimit', 10)
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
    $network = Network::polygon()->firstOrFail();

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
        ->assertInertia(fn (Assert $page) => $page
            ->component('Collections/View')
            ->has('appliedFilters', fn (Assert $page) => $page->where('owned', true)
                ->where('traits', null)
                ->where('tab', 'collection')
                ->where('pageLimit', 10)
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
        ->assertJsonCount(5);
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
        ->assertJsonCount(5);
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
        ->assertJsonCount(5)
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
        ]]);
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
        ->assertJsonCount(5);
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
        ->assertJsonCount(5);
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
        ->assertJsonCount(5);
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
        ->assertJsonCount(5);
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
        ->assertJsonCount(5);
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
        ->assertJsonCount(5);
});
