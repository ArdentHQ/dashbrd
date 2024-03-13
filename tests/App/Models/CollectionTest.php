<?php

declare(strict_types=1);

use App\Data\VolumeData;
use App\Enums\CurrencyCode;
use App\Enums\NftTransferType;
use App\Enums\Period;
use App\Models\Article;
use App\Models\Collection;
use App\Models\CollectionTrait;
use App\Models\CollectionVote;
use App\Models\CollectionWinner;
use App\Models\FloorPriceHistory;
use App\Models\Gallery;
use App\Models\Network;
use App\Models\Nft;
use App\Models\NftActivity;
use App\Models\SpamContract;
use App\Models\Token;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Support\Facades\Config;

it('can create a basic collection', function () {
    $collection = Collection::factory()->create();

    expect($collection->name)->not()->toBeNull();
});

it('can retrieve the nfts that belong to the collection', function () {
    $collection = Collection::factory()->create();

    expect($collection->nfts()->count())->toBe(0);

    $nft = Nft::factory()->create([
        'collection_id' => $collection->id,
    ]);

    expect($collection->nfts()->count())->toBe(1);
});

it('should have an article', function () {
    $collection = Collection::factory()->create();

    $article = Article::factory()->create();

    $collection->articles()->attach($article, ['order_index' => 1]);

    expect($collection->articles->first()->id)->toBe($article->id);
});

it('can retrieve the galleries that have an item from the collection', function () {
    $collection = Collection::factory()->create();
    $collection2 = Collection::factory()->create();

    // 2 NFTs for collection 1
    $nft1 = Nft::factory()->create(['collection_id' => $collection->id]);
    $nft2 = Nft::factory()->create(['collection_id' => $collection->id]);

    // A NFT for collection 2
    $nft3 = Nft::factory()->create(['collection_id' => $collection2->id]);

    // Another NFT for collection 1
    $nft4 = Nft::factory()->create(['collection_id' => $collection->id]);

    // Gallery that will contain 2 NFTs from collection 1 and 1 NFT from collection 2
    $gallery = Gallery::factory()->create();
    $gallery->nfts()->attach($nft1->id, ['order_index' => 1]);
    $gallery->nfts()->attach($nft3->id, ['order_index' => 1]);
    $gallery->nfts()->attach($nft4->id, ['order_index' => 1]);

    // Gallery that will contain 1 NFT from collection 2
    $gallery2 = Gallery::factory()->create();
    $gallery2->nfts()->attach($nft3->id, ['order_index' => 1]);

    // Gallery that will contain 1 NFT from collection 1
    $gallery3 = Gallery::factory()->create();
    $gallery3->nfts()->attach($nft2->id, ['order_index' => 1]);

    // Gallery without nfts
    Gallery::factory()->create();

    expect($collection->galleries()->count())->toBe(2);
    expect($collection->galleries()->pluck('id')->toArray())
        ->toEqualCanonicalizing([$gallery->id, $gallery3->id]);

    expect($collection2->galleries()->count())->toBe(2);
    expect($collection2->galleries()->pluck('id')->toArray())
        ->toEqualCanonicalizing([$gallery->id, $gallery2->id]);
});

it('can retrieve the collection website', function () {
    $collection = Collection::factory()->create([
        'extra_attributes' => [
            'image' => 'test',
            'website' => 'test.test',
        ],
    ]);

    expect($collection->website())->toBe('https://test.test');

    $collection = Collection::factory()->create([
        'extra_attributes' => [
            'image' => 'test',
            'website' => 'https://test.test',
        ],
    ]);

    expect($collection->website())->toBe('https://test.test');

    $collection = Collection::factory()->create([
        'extra_attributes' => [
            'image' => 'test',
            'website' => 'http://test.test',
        ],
    ]);

    expect($collection->website())->toBe('http://test.test');

    $collection = Collection::factory()->create([
        'address' => '0xtest',
        'extra_attributes' => [
            'image' => 'test',
            'website' => null,
        ],
    ]);

    expect($collection->website(defaultToExplorer: false))->toBeNull();

    $collection = Collection::factory()->create([
        'address' => '0xtest',
        'extra_attributes' => [
            'image' => 'test',
            'website' => 'https://mumbai.polygonscan.com/test',
        ],
    ]);

    expect($collection->website(defaultToExplorer: false))->toBeNull();

    $collection = Collection::factory()->create([
        'address' => '0xtest',
        'extra_attributes' => [
            'image' => 'test',
            'website' => null,
        ],
    ]);

    expect($collection->website(defaultToExplorer: true))->not->toBeNull();
});

it('can get reporting throttle duration', function () {
    $method = new \ReflectionMethod(Collection::class, 'reportingThrottleDuration');
    $method->setAccessible(true);

    expect($method->invoke(new Collection))->toBeInt();
});

it('filters the collections by collection name', function () {
    $user = createUser();

    $collection1 = Collection::factory()->create([
        'name' => 'Test name',
    ]);

    $collection2 = Collection::factory()->create([
        'name' => 'Test name 2',
    ]);

    $collection3 = Collection::factory()->create([
        'name' => 'Another',
    ]);

    expect(Collection::search($user, 'Test')->count())->toBe(2);

    expect(Collection::search($user, 'Test')->get()->pluck('id')->toArray())
        ->toEqualCanonicalizing([$collection1->id, $collection2->id]);

    expect(Collection::search($user, 'Another')->count())->toBe(1);
});

it('should search collections by collection name', function () {
    $collection1 = Collection::factory()->create([
        'name' => 'Test name',
    ]);

    $collection2 = Collection::factory()->create([
        'name' => 'Test name 2',
    ]);

    $collection3 = Collection::factory()->create([
        'name' => 'Another',
    ]);

    expect(Collection::searchByName('Test')->count())->toBe(2)
        ->and(Collection::searchByName('Test')->get()->pluck('id')->toArray())
        ->toEqualCanonicalizing([$collection1->id, $collection2->id])
        ->and(Collection::searchByName('Another')->count())->toBe(1);

});

it('filters the collections by a nft name', function () {
    $user = createUser();

    $collection1 = Collection::factory()->create([
        'name' => 'Collection 1',
    ]);

    $collection2 = Collection::factory()->create([
        'name' => 'Collection 2',
    ]);

    $collection3 = Collection::factory()->create([
        'name' => 'Collection 2',
    ]);

    Nft::factory()->create([
        'name' => 'Test name',
        'collection_id' => $collection1->id,
        'wallet_id' => $user->wallet_id,
    ]);
    Nft::factory()->create([
        'name' => 'Another name',
        'collection_id' => $collection2->id,
        'wallet_id' => $user->wallet_id,
    ]);
    Nft::factory()->create([
        'name' => 'Test name',
        'collection_id' => $collection3->id,
        'wallet_id' => $user->wallet_id,
    ]);

    expect(Collection::search($user, 'Test')->count())->toBe(2);

    expect(Collection::search($user, 'Test')->get()->pluck('id')->toArray())
        ->toEqualCanonicalizing([$collection1->id, $collection3->id]);

    expect(Collection::search($user, 'Another')->count())->toBe(1);
});

it('filters the collections by nft token number', function () {
    $user = createUser();

    $collection1 = Collection::factory()->create([
        'name' => 'Collection 1',
    ]);

    $collection2 = Collection::factory()->create([
        'name' => 'Collection 2',
    ]);

    $collection3 = Collection::factory()->create([
        'name' => 'Collection 2',
    ]);

    Nft::factory()->create([
        'name' => 'NFT1',
        'token_number' => 12345,
        'collection_id' => $collection1->id,
        'wallet_id' => $user->wallet_id,
    ]);
    Nft::factory()->create([
        'name' => 9999,
        'token_number' => 123,
        'collection_id' => $collection2->id,
        'wallet_id' => $user->wallet_id,
    ]);
    Nft::factory()->create([
        'name' => 4567,
        'token_number' => 1234,
        'collection_id' => $collection3->id,
        'wallet_id' => $user->wallet_id,
    ]);

    expect(Collection::search($user, '45')->count())->toBe(2);

    expect(Collection::search($user, '45')->get()->pluck('id')->toArray())
        ->toEqualCanonicalizing([$collection1->id, $collection3->id]);

    expect(Collection::search($user, '9999')->count())->toBe(1);
});

it('should filter collections by chainId', function () {
    $ethNetwork = Network::query()->where('chain_id', 1)->first();
    $polygonNetwork = Network::query()->where('chain_id', 137)->first();

    Collection::factory()->create([
        'name' => 'Collection 1',
        'network_id' => $ethNetwork->id,
    ]);

    Collection::factory()->create([
        'name' => 'Collection 2',
        'network_id' => $polygonNetwork->id,
    ]);

    $ethCollections = Collection::query()->filterByChainId(1)->get();

    expect($ethCollections->count())->toBe(1)
        ->and($ethCollections->first()->name)->toBe('Collection 1');

    $polygonCollections = Collection::query()->filterByChainId(137)->get();

    expect($polygonCollections->count())->toBe(1)
        ->and($polygonCollections->first()->name)->toBe('Collection 2');

    $allCollections = Collection::query()->filterByChainId(null)->orderBy('id')->get();

    expect($allCollections->count())->toBe(2)
        ->and($allCollections[0]->name)->toBe('Collection 1')
        ->and($allCollections[1]->name)->toBe('Collection 2');
});

it('filters the collections by nft concatenated name', function () {
    $user = createUser();

    $collection1 = Collection::factory()->create([
        'name' => 'Collection 1',
    ]);

    $collection2 = Collection::factory()->create([
        'name' => 'Collection 2',
    ]);

    $collection3 = Collection::factory()->create([
        'name' => 'Collection 2',
    ]);

    Nft::factory()->create([
        'token_number' => 12345,
        'name' => 'Nft',
        'collection_id' => $collection1->id,
        'wallet_id' => $user->wallet_id,
    ]);

    Nft::factory()->create([
        'collection_id' => $collection2->id,
        'wallet_id' => $user->wallet_id,
    ]);
    Nft::factory()->create([
        'collection_id' => $collection3->id,
        'wallet_id' => $user->wallet_id,
    ]);

    expect(Collection::search($user, 'NFT #12345')->count())->toBe(1);
});

it('can retrieve traits', function () {
    $collection = Collection::factory()->create();
    $collection2 = Collection::factory()->create();

    CollectionTrait::factory(2)->create(['collection_id' => $collection['id']]);
    CollectionTrait::factory(5)->create(['collection_id' => $collection2['id']]);

    expect($collection->fresh()->traits()->count())->toBe(2)
        ->and($collection2->fresh()->traits()->count())->toBe(5);
});

it('should get twitter url if available', function () {
    $collection = Collection::factory()->create([
        'extra_attributes' => [
            'socials' => [
                'twitter' => 'testuser',
            ],
        ],
    ]);

    expect($collection->twitter())->toBe('https://x.com/testuser');
});

it('should get discord url if available', function () {
    $collection = Collection::factory()->create([
        'extra_attributes' => [
            'socials' => [
                'discord' => 'testuser',
            ],
        ],
    ]);

    expect($collection->discord())->toBe('https://discord.gg/testuser');
});

it('strips html from the description', function () {
    Collection::factory()->create([
        'description' => '<div>Hello World</div>',
    ]);

    // On save...
    $this->assertDatabaseHas('collections', [
        'description' => 'Hello World',
    ]);

    // Null values...
    Collection::factory()->create([
        'description' => null,
    ]);

    $this->assertDatabaseHas('collections', [
        'description' => null,
    ]);

    // On get...
    expect((new Collection)->forceFill([
        'description' => '<div>Hello World</div>',
    ])->description)->toBe('Hello World');

    expect((new Collection)->forceFill([
        'description' => null,
    ])->description)->toBeNull();
});

it('can sort collections using usd as default and considering the number of nfts', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);
    $otherWallet = Wallet::factory()->create();

    // 5 usd * 1 nft = 5 usd
    // for the other wallet same value
    $collection1 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => 5,
            'EUR' => 4,
        ],
    ])->id;

    Nft::factory()->count(1)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => $collection1,
    ]);
    Nft::factory()->count(1)->create([
        'wallet_id' => $otherWallet->id,
        'collection_id' => $collection1,
    ]);

    // 3 usd * 2 nft = 6 usd
    // for the other wallet 3 usd * 3 nft = 9 usd
    $collection2 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => 3,
            'EUR' => 2,
        ],
    ])->id;
    Nft::factory()->count(2)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => $collection2,
    ]);
    Nft::factory()->count(3)->create([
        'wallet_id' => $otherWallet->id,
        'collection_id' => $collection2,
    ]);

    // Not assigned to user
    Collection::factory()->create([
        'fiat_value' => [
            'USD' => 8,
            'EUR' => 5,
        ],
    ]);

    // 0 usd * 10 nft = 0
    $collection4 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => null,
            'EUR' => 1,
        ],
    ])->id;
    Nft::factory()->count(10)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => $collection4,
    ]);

    // 1 usd * 7 nft = 7 usd
    // for the other wallet 1 usd * 1 nft = 1 usd
    $collection5 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => 1,
            'EUR' => 0,
        ],
    ])->id;
    Nft::factory()->count(7)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => $collection5,
    ]);
    Nft::factory()->count(1)->create([
        'wallet_id' => $otherWallet->id,
        'collection_id' => $collection5,
    ]);

    $ordered = $user->collections()->orderByValue($wallet, 'asc')->pluck('id')->toArray();

    expect($ordered)->toEqual([
        $collection4, // 0
        $collection1, // 5
        $collection2, // 6
        $collection5, // 7
    ]);

    // Different order for wallet 2
    $ordered = $user->collections()->orderByValue($otherWallet, 'asc')->pluck('id')->toArray();
    expect($ordered)->toEqual([
        $collection4, // 0
        $collection5, // 1
        $collection1, // 5
        $collection2, // 9
    ]);

    $ordered = $user->collections()->orderByValue($wallet, 'desc')->pluck('id')->toArray();

    expect($ordered)->toEqual([
        $collection5, // 7
        $collection2, // 6
        $collection1, // 5
        $collection4, // 0
    ]);

    // Different order for wallet 2
    $ordered = $user->collections()->orderByValue($otherWallet, 'desc')->pluck('id')->toArray();
    expect($ordered)->toEqual([
        $collection2, // 9
        $collection1, // 5
        $collection5, // 1
        $collection4, // 0
    ]);
});

it('can sort collections using other currency', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);

    $user2 = User::factory()->create();
    $wallet2 = Wallet::factory()->create(['user_id' => $user2->id]);

    // 4 eur * 1 nft = 4 eur, partially assigned to other wallet
    $collection1 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => 5,
            'EUR' => 4,
        ],
    ])->id;
    Nft::factory()->count(1)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => $collection1,
    ]);
    Nft::factory()->count(1)->create([
        'wallet_id' => $wallet2->id,
        'collection_id' => $collection1,
    ]);

    // 1 eur * 2 nft = 1 eur
    $collection2 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => 3,
            'EUR' => 1,
        ],
    ])->id;
    Nft::factory()->count(2)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => $collection2,
    ]);

    // Assign to another wallet
    $collection3 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => 8,
            'EUR' => 5,
        ],
    ])->id;
    Nft::factory()->count(2)->create([
        'wallet_id' => $wallet2->id,
        'collection_id' => $collection3,
    ]);

    // 1 eur * 10 nft = 10 eur
    $collection4 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => null,
            'EUR' => 1,
        ],
    ])->id;
    Nft::factory()->count(10)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => $collection4,
    ]);

    // 0 eur * 7 nft = 0
    $collection5 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => 1,
            'EUR' => 0,
        ],
    ])->id;
    Nft::factory()->count(7)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => $collection5,
    ]);

    $ordered = $user->collections()->orderByValue($wallet, 'asc', CurrencyCode::EUR)->pluck('id')->toArray();

    expect($ordered)->toEqual([
        $collection5, // 0
        $collection2, // 1
        $collection1, // 4
        $collection4, // 10
    ]);

    $ordered = $user->collections()->orderByValue($wallet, 'desc', CurrencyCode::EUR)->pluck('id')->toArray();

    expect($ordered)->toEqual([
        $collection4, // 10
        $collection1, // 4
        $collection2, // 1
        $collection5, // 0
    ]);
});

it('can sort collections by floor price, but in fiat value', function () {
    $collection1 = Collection::factory()->create([
        'floor_price' => 10,
        'fiat_value' => [
            'USD' => 5,
            'EUR' => 4,
        ],
    ]);

    Nft::factory()->count(2)->create([
        'collection_id' => $collection1,
    ]);

    $collection2 = Collection::factory()->create([
        'floor_price' => 9,
        'fiat_value' => [
            'USD' => 3,
            'EUR' => 2,
        ],
    ]);

    Nft::factory()->count(5)->create([
        'collection_id' => $collection2,
    ]);

    $collection3 = Collection::factory()->create([
        'floor_price' => 8,
        'fiat_value' => [
            'USD' => 8,
            'EUR' => 5,
        ],
    ]);

    $collection4 = Collection::factory()->create([
        'floor_price' => 7,
        'fiat_value' => [
            'USD' => null,
            'EUR' => 1,
        ],
    ]);

    $collection5 = Collection::factory()->create([
        'floor_price' => 6,
        'fiat_value' => [
            'USD' => 1,
            'EUR' => 0,
        ],
    ]);

    Nft::factory()->count(7)->create([
        'collection_id' => $collection5,
    ]);

    $ordered = Collection::orderByFloorPrice('asc', CurrencyCode::EUR)->get();

    expect($ordered->modelKeys())->toEqual([
        $collection5->id,
        $collection4->id,
        $collection2->id,
        $collection1->id,
        $collection3->id,
    ]);

    $ordered = Collection::orderByFloorPrice('desc', CurrencyCode::EUR)->get();

    expect($ordered->modelKeys())->toEqual([
        $collection3->id,
        $collection1->id,
        $collection2->id,
        $collection4->id,
        $collection5->id,
    ]);

    $ordered = Collection::orderByFloorPrice('desc', CurrencyCode::USD)->get();

    expect($ordered->modelKeys())->toEqual([
        $collection3->id,
        $collection1->id,
        $collection2->id,
        $collection5->id,
        $collection4->id,
    ]);
});

it('can sort collections by nfts received date', function () {
    $nft1 = Nft::factory()->create();

    $wallet = $nft1->wallet;

    $otherWallet = Wallet::factory()->create();

    // Latest activity timestamp -> 5 (second oldest activity)
    foreach ([
        NftTransferType::Mint->value => 1, // timestamp = 1
        NftTransferType::Transfer->value => 3, // timestamp = 3
        NftTransferType::Sale->value => 5, // timestamp = 5
    ] as $type => $timestamp) {
        NftActivity::factory()->create([
            'collection_id' => $nft1->collection_id,
            'token_number' => $nft1->token_number,
            'type' => $type,
            'timestamp' => $timestamp,
            'recipient' => $wallet->address,
        ]);
    }

    // Create activity for some other wallet...
    NftActivity::factory()->create([
        'collection_id' => $nft1->collection_id,
        'token_number' => $nft1->token_number,
        'type' => NftTransferType::Sale,
        'timestamp' => 10,
        'recipient' => $otherWallet->address,
    ]);

    // Latest activity timestamp -> 7 (recent activity)
    $nft2 = Nft::factory()->recycle($wallet)->create();
    foreach ([
        NftTransferType::Transfer->value => 7, // timestamp = 7
        NftTransferType::Mint->value => 4, // timestamp = 4
        NftTransferType::Sale->value => 6, // timestamp = 6
    ] as $type => $timestamp) {
        NftActivity::factory()->create([
            'collection_id' => $nft2->collection_id,
            'token_number' => $nft2->token_number,
            'type' => $type,
            'timestamp' => $timestamp,
            'recipient' => $wallet->address,
        ]);
    }

    // Create activity for some other wallet...
    NftActivity::factory()->create([
        'collection_id' => $nft2->collection_id,
        'token_number' => $nft2->token_number,
        'type' => NftTransferType::Sale,
        'timestamp' => 15,
        'recipient' => $otherWallet->address,
    ]);

    // Latest activity timestamp -> 3 (oldest activity)
    $nft3 = Nft::factory()->recycle($wallet)->create();
    foreach ([
        NftTransferType::Transfer->value => 2, // timestamp = 2
        NftTransferType::Mint->value => 3, // timestamp = 3
        NftTransferType::Sale->value => 1, // timestamp = 1
    ] as $type => $timestamp) {
        NftActivity::factory()->create([
            'collection_id' => $nft3->collection_id,
            'token_number' => $nft3->token_number,
            'type' => $type,
            'timestamp' => $timestamp,
            'recipient' => $wallet->address,
        ]);
    }

    // NFT without the "received" activity... (third oldest activity)
    // Latest activity timestamp -> 4
    $nft4 = Nft::factory()->recycle($wallet)->create();
    foreach ([
        NftTransferType::Sale->value => 4, // timestamp = 4
        NftTransferType::Mint->value => 1, // timestamp = 1
    ] as $type => $timestamp) {
        NftActivity::factory()->create([
            'collection_id' => $nft4->collection_id,
            'token_number' => $nft4->token_number,
            'type' => $type,
            'timestamp' => $timestamp,
            'recipient' => $wallet->address,
        ]);
    }

    // Nft without any activity...
    $nft5 = Nft::factory()->recycle($wallet)->create();

    // Should return recent activities first...
    $collections = $wallet->user->collections()->orderByReceivedDate($wallet, 'desc')->get();

    expect($collections->modelKeys())->toBe([
        $nft2->collection->id, $nft1->collection->id, $nft4->collection->id, $nft3->collection->id, $nft5->collection->id,
    ]);

    // Should return oldest activities first...
    $collections = $wallet->user->collections()->orderByReceivedDate($wallet, 'asc')->get();

    expect($collections->modelKeys())->toBe([
        $nft5->collection->id, $nft3->collection->id, $nft4->collection->id, $nft1->collection->id, $nft2->collection->id,
    ]);
});

it('can sort collections by nfts mint date', function () {
    $first = Collection::factory()->create([
        'minted_at' => now()->subMinutes(5),
    ]);

    $second = Collection::factory()->create([
        'minted_at' => now()->subMinutes(10),
    ]);

    $third = Collection::factory()->create([
        'minted_at' => now()->subMinutes(2),
    ]);

    $collections = Collection::orderByMintDate('desc')->get();

    expect($collections->modelKeys())->toBe([
        $third->id, $first->id, $second->id,
    ]);

    $collections = Collection::orderByMintDate('asc')->get();

    expect($collections->modelKeys())->toBe([
        $second->id, $first->id, $third->id,
    ]);
});

it('can determine whether collection was recently viewed', function () {
    $collection = new Collection([
        'last_viewed_at' => null,
    ]);

    expect($collection->recentlyViewed())->toBeFalse();

    $collection = new Collection([
        'last_viewed_at' => now()->subMinutes(30),
    ]);

    expect($collection->recentlyViewed())->toBeTrue();

    $collection = new Collection([
        'last_viewed_at' => now()->subDays(1)->subHours(1),
    ]);

    expect($collection->recentlyViewed())->toBeFalse();
});

it('can determine whether the collection is potentially full', function () {
    expect((new Collection([
        'supply' => null,
    ]))->isPotentiallyFull())->toBeFalse();

    expect((new Collection([
        'last_indexed_token_number' => null,
    ]))->isPotentiallyFull())->toBeFalse();

    expect((new Collection([
        'supply' => 10,
        'last_indexed_token_number' => 10,
    ]))->isPotentiallyFull())->toBeTrue();

    $collection = Collection::factory()->create([
        'supply' => 10,
        'last_indexed_token_number' => 5,
    ]);

    Nft::factory(5)->recycle($collection)->create();

    expect($collection->isPotentiallyFull())->toBeFalse();

    $collection = Collection::factory()->create([
        'last_indexed_token_number' => 5,
        'supply' => 10,
    ]);

    Nft::factory(10)->recycle($collection)->create();

    expect($collection->isPotentiallyFull())->toBeTrue();

    // zero-based NFT token numbers
    $collection = Collection::factory()->create([
        'last_indexed_token_number' => 9,
        'supply' => 10,
    ]);

    Nft::factory(10)->recycle($collection)->create();

    expect($collection->isPotentiallyFull())->toBeTrue();

    // burning
    $collection = Collection::factory()->create([
        'last_indexed_token_number' => 1,
        'supply' => 10,
    ]);

    Nft::factory(20)->recycle($collection)->create();

    expect($collection->isPotentiallyFull())->toBeTrue();

    // arbitrary value
    $collection = Collection::factory()->create([
        'last_indexed_token_number' => '115790067969782405922571518180952299168544685841472255659504762311331546978981',
        'supply' => 10,
    ]);

    Nft::factory(10)->recycle($collection)->create();

    expect($collection->isPotentiallyFull())->toBeTrue();
});

it('should mark collection as invalid - unacceptable supply', function () {
    $collection = new Collection([
        'supply' => null,
    ]);

    expect($collection->isInvalid())->toBeTrue();

    Config::set('dashbrd.collections_max_cap', 5000);

    $collection = new Collection([
        'supply' => 5001,
    ]);

    expect($collection->isInvalid())->toBeTrue();
});

it('should mark collection as invalid - spam check', function () {
    $network = new Network(['id' => 1]);

    $collection1 = new Collection([
        'supply' => 3000,
        'address' => '0x123',
    ]);

    $collection1->setAttribute('network', $network);

    $collection2 = new Collection([
        'supply' => 3000,
        'address' => '0x1234',
    ]);

    $collection2->setAttribute('network', $network);

    SpamContract::query()->insert([
        'address' => $collection1->address,
        'network_id' => $network->id,
    ]);

    expect($collection1->isInvalid(withSpamCheck: false))->toBeFalse()
        ->and($collection1->isInvalid())->toBeTrue()
        ->and($collection2->isInvalid())->toBeFalse();
});

it('should mark collection as invalid - blacklisted', function () {
    config(['dashbrd.blacklisted_collections' => [
        '0x123',
    ]]);

    $collection1 = new Collection([
        'supply' => 3000,
        'address' => '0x123',
    ]);

    expect($collection1->isInvalid())->toBeTrue();
});

it('should exclude spam contracts', function () {
    $network = Network::factory()->create();

    [$collection, $other] = Collection::factory(2)->create([
        'network_id' => $network->id,
    ]);

    $spamContract = SpamContract::create([
        'address' => $collection->address,
        'network_id' => $collection->network_id,
    ]);

    $otherSpamContract = SpamContract::create([
        'address' => $other->address,
        'network_id' => Network::factory()->create()->id,
    ]);

    expect($collection->spamContract->is($spamContract))->toBeTrue();
    expect($other->spamContract)->toBeNull();

    $collections = Collection::withoutSpamContracts()->get();

    expect($collections->count())->toBe(1);
    expect($collections->first()->slug)->toBe($other->slug);
});

it('should exclude collections with an invalid supply', function () {
    Config::set('dashbrd.collections_max_cap', 5000);

    $network = Network::factory()->create();

    $collection1 = Collection::factory()->create([
        'network_id' => $network->id,
        'supply' => 3000,
    ]);

    Collection::factory()->create([
        'network_id' => $network->id,
        'supply' => null,
    ]);

    Collection::factory()->create([
        'network_id' => $network->id,
        'supply' => 5001,
    ]);

    $validCollections = Collection::query()->withAcceptableSupply()->get();

    expect($validCollections->count())->toBe(1)
        ->and($validCollections->first()->slug)->toBe($collection1->slug);
});

it('filters collections that belongs to wallets that have been signed at least one time', function () {
    $signed = Wallet::factory()->create([
        'last_signed_at' => now(),
    ]);

    $notSigned = Wallet::factory()->create([
        'last_signed_at' => null,
    ]);

    $signed2 = Wallet::factory()->create([
        'last_signed_at' => now(),
    ]);

    // Has a signed wallet and a not signed wallet
    $collection1 = Collection::factory()->create();
    Nft::factory()->create([
        'wallet_id' => $signed->id,
        'collection_id' => $collection1->id,
    ]);
    Nft::factory()->create([
        'wallet_id' => $notSigned->id,
        'collection_id' => $collection1->id,
    ]);

    // Has a not signed wallet
    $collection2 = Collection::factory()->create();
    Nft::factory()->create([
        'wallet_id' => $notSigned->id,
        'collection_id' => $collection2->id,
    ]);

    // Does not have any wallet
    $collection3 = Collection::factory()->create();

    // Has a signed wallet
    $collection4 = Collection::factory()->create();
    Nft::factory()->create([
        'wallet_id' => $signed2->id,
        'collection_id' => $collection4->id,
    ]);

    $filtered = Collection::query()->withSignedWallets()->get();

    expect($filtered->count())->toBe(2);

    expect($filtered->pluck('id')->contains($collection1->id))->toBeTrue();
    expect($filtered->pluck('id')->contains($collection4->id))->toBeTrue();
});

it('should get openSeaSlug', function () {
    $collection = Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug' => 'test-collection',
        ],
    ]);

    expect($collection->openSeaSlug())->toBe('test-collection');
});

it('sorts collections last time nft was fetched', function () {
    // fetched yesterday
    $collection1 = Collection::factory()->create([
        'extra_attributes' => [
            'nft_last_fetched_at' => now()->subDays(1),
        ],
    ]);

    // fetched one month ago
    $collection2 = Collection::factory()->create([
        'extra_attributes' => [
            'nft_last_fetched_at' => now()->subMonth(),
        ],
    ]);

    // never fetched
    $collection3 = Collection::factory()->create();

    // fetched now
    $collection4 = Collection::factory()->create([
        'extra_attributes' => [
            'nft_last_fetched_at' => now(),
        ],
    ]);

    $ids = Collection::orderByOldestNftLastFetchedAt()->pluck('id')->toArray();

    expect($ids)->toEqual([
        $collection3->id,
        $collection2->id,
        $collection1->id,
        $collection4->id,
    ]);
});

it('sorts collections last time floor price was fetched', function () {
    // fetched yesterday
    $collection1 = Collection::factory()->create([
        'extra_attributes' => [
            'floor_price_last_fetched_at' => now()->subDays(1),
        ],
    ]);

    // fetched one month ago
    $collection2 = Collection::factory()->create([
        'extra_attributes' => [
            'floor_price_last_fetched_at' => now()->subMonth(),
        ],
    ]);

    // never fetched
    $collection3 = Collection::factory()->create();

    // fetched now
    $collection4 = Collection::factory()->create([
        'extra_attributes' => [
            'floor_price_last_fetched_at' => now(),
        ],
    ]);

    $ids = Collection::orderByFloorPriceLastFetchedAt()->pluck('id')->toArray();

    expect($ids)->toEqual([
        $collection3->id,
        $collection2->id,
        $collection1->id,
        $collection4->id,
    ]);
});

it('sorts collections last time opesea slug was fetched', function () {
    // fetched yesterday
    $collection1 = Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug_last_fetched_at' => now()->subDays(1),
        ],
    ]);

    // fetched one month ago
    $collection2 = Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug_last_fetched_at' => now()->subMonth(),
        ],
    ]);

    // never fetched
    $collection3 = Collection::factory()->create();

    // fetched now
    $collection4 = Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug_last_fetched_at' => now(),
        ],
    ]);

    $ids = Collection::orderByOpenseaSlugLastFetchedAt()->pluck('id')->toArray();

    expect($ids)->toEqual([
        $collection3->id,
        $collection2->id,
        $collection1->id,
        $collection4->id,
    ]);
});

it('can determine whether collection has its activities indexed', function () {
    config([
        'dashbrd.activity_blacklist' => [
            '0x123',
        ],
    ]);

    expect(Collection::factory()->create([
        'address' => '0x123',
    ])->indexesActivities())->toBeFalse();

    expect(Collection::factory()->create([
        'address' => '0x1234',
    ])->indexesActivities())->toBeTrue();

    expect(Collection::factory()->create([
        'address' => '0x12345',
        'supply' => null,
    ])->indexesActivities())->toBeFalse();

    expect(Collection::factory()->create([
        'address' => '0x123456',
        'supply' => 100000,
    ])->indexesActivities())->toBeFalse();
});

it('can determine if a collection is featured or not using its scope', function () {
    $featuredCollection1 = Collection::factory()->create(['is_featured' => true]);
    $featuredCollection2 = Collection::factory()->create(['is_featured' => true]);
    $nonFeaturedCollection = Collection::factory()->create(['is_featured' => false]);

    $featuredCollections = Collection::featured()->get();

    $this->assertTrue($featuredCollections->contains($featuredCollection1));
    $this->assertTrue($featuredCollections->contains($featuredCollection2));
    $this->assertFalse($featuredCollections->contains($nonFeaturedCollection));

    $this->assertEquals(2, Collection::featured()->count());
});

it('returns the collection of the month by most votes in the last month', function () {
    $collectionWith5Votes = Collection::factory()->create();
    CollectionVote::factory()->count(5)->create([
        'collection_id' => $collectionWith5Votes->id,
        'voted_at' => Carbon::now()->subMonth(),
    ]);

    $collectionWith1Vote = Collection::factory()->create();
    CollectionVote::factory()->count(1)->create([
        'collection_id' => $collectionWith1Vote->id,
        'voted_at' => Carbon::now()->subMonth(),
    ]);

    $collectionWith8Votes = Collection::factory()->create();
    CollectionVote::factory()->count(8)->create([
        'collection_id' => $collectionWith8Votes->id,
        'voted_at' => Carbon::now()->subMonth(),
    ]);

    // Not included
    $collectionWithoutVotes = Collection::factory()->create();

    $collectionWith3Votes = Collection::factory()->create();
    CollectionVote::factory()->count(3)->create([
        'collection_id' => $collectionWith3Votes->id,
        'voted_at' => Carbon::now()->subMonth(),
    ]);

    $collectionsIds = Collection::winnersOfThePreviousMonth()->pluck('id')->toArray();

    expect($collectionsIds)->toBe([
        $collectionWith8Votes->id,
        $collectionWith5Votes->id,
        $collectionWith3Votes->id,
        $collectionWith1Vote->id,
    ]);
});

it('has floor price history', function () {
    $collection = Collection::factory()->create();

    FloorPriceHistory::factory()->count(3)->create([
        'collection_id' => $collection->id,
    ]);

    FloorPriceHistory::factory()->count(2)->create();

    expect($collection->floorPriceHistory()->count())->toBe(3);

    expect($collection->floorPriceHistory()->first())->toBeInstanceOf(FloorPriceHistory::class);
});

it('can scope the query to only include collections eligible for winning "collection of the month"', function () {
    CollectionWinner::factory()->create([
        'rank' => 1,
        'month' => 10,
        'year' => 2023,
    ]);

    CollectionWinner::factory()->create([
        'rank' => 1,
        'month' => 9,
        'year' => 2023,
    ]);

    $winner = CollectionWinner::factory()->create([
        'rank' => 2,
        'month' => 10,
        'year' => 2023,
    ]);

    $collections = Collection::eligibleToWin()->get();

    expect(Collection::count())->toBe(3);
    expect($collections)->toHaveCount(1);
    expect($collections->contains($winner->collection))->toBeTrue();
});

it('should get sum of fiat values of collections', function () {
    Collection::factory()->create([
        'fiat_value' => [
            'USD' => 10,
            'EUR' => 20,
        ],
    ]);

    Collection::factory()->create([
        'fiat_value' => [
            'USD' => 20,
            'EUR' => 30,
            'AZN' => 45,
        ],
    ]);

    Collection::factory()->create([
        'fiat_value' => [
            'EUR' => 30,
        ],
    ]);

    Collection::factory()->create();

    $fiatValues = collect(Collection::getFiatValueSum());

    expect($fiatValues->where('key', 'USD')->first()->total)->toBeString(30);
    expect($fiatValues->where('key', 'EUR')->first()->total)->toBeString(80);
    expect($fiatValues->where('key', 'AZN')->first()->total)->toBeString(45);
});

it('should sort collections', function () {
    // 4 eur * 2 nft = 8 eur
    $collection1 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => 5,
            'EUR' => 4,
        ],
    ])->id;

    Nft::factory()->count(2)->create([
        'collection_id' => $collection1,
    ]);

    // 1 eur * 2 nft = 2 eur
    $collection2 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => 3,
            'EUR' => 1,
        ],
    ])->id;

    Nft::factory()->count(2)->create([
        'collection_id' => $collection2,
    ]);

    // 5 eur * 2 = 10 eur
    $collection3 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => 8,
            'EUR' => 5,
        ],
    ])->id;

    Nft::factory()->count(2)->create([
        'collection_id' => $collection3,
    ]);

    // 1 eur * 10 nft = 10 eur
    $collection4 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => null,
            'EUR' => 1,
        ],
    ])->id;

    Nft::factory()->count(10)->create([
        'collection_id' => $collection4,
    ]);

    // 0 eur * 7 nft = 0
    $collection5 = Collection::factory()->create([
        'fiat_value' => [
            'USD' => 1,
            'EUR' => 0,
        ],
    ])->id;

    Nft::factory()->count(7)->create([
        'collection_id' => $collection5,
    ]);

    $ordered = Collection::query()->orderByValue(null, 'asc', CurrencyCode::EUR)->pluck('id')->toArray();

    expect($ordered)->toEqual([
        $collection5, // 0
        $collection2, // 1
        $collection1, // 4
        $collection3, // 8
        $collection4, // 10
    ]);

    $ordered = Collection::query()->orderByValue(null, 'desc', CurrencyCode::EUR)->pluck('id')->toArray();

    expect($ordered)->toEqual([
        $collection4, // 10
        $collection3, // 8
        $collection1, // 4
        $collection2, // 1
        $collection5, // 0
    ]);
});

it('can create volume data for a collection', function () {
    Token::factory()->matic()->create([
        'is_native_token' => true,
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->for($network)->create([
        'volume_30d' => '3',
    ]);

    expect($collection->createVolumeData(Period::MONTH, CurrencyCode::USD))->toBeInstanceOf(VolumeData::class);
});

it('can get volume based on the period', function () {
    $collection = Collection::factory()->create([
        'total_volume' => '1',
        'volume_1d' => '2',
        'volume_7d' => '3',
        'volume_30d' => '4',
    ]);

    expect($collection->getVolume())->toBe('1');
    expect($collection->getVolume(Period::DAY))->toBe('2');
    expect($collection->getVolume(Period::WEEK))->toBe('3');
    expect($collection->getVolume(Period::MONTH))->toBe('4');
});

it('can get native token for a network', function () {
    $token = Token::factory()->matic()->create([
        'is_native_token' => true,
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->for($network)->create();

    expect($collection->nativeToken()->is($token))->toBeTrue();
});

it('can order collections based on the total fiat amount of sales volume', function () {
    $ethereum = Network::firstWhere('chain_id', 1);
    $polygon = Network::firstWhere('chain_id', 137);

    $eth = Token::factory()->create([
        'network_id' => $ethereum->id,
        'is_native_token' => true,
        'decimals' => 1,
        'extra_attributes' => [
            'market_data' => [
                'current_prices' => [
                    'usd' => 10,
                ],
            ],
        ],
    ]);

    $matic = Token::factory()->create([
        'network_id' => $polygon->id,
        'is_native_token' => true,
        'decimals' => 1,
        'extra_attributes' => [
            'market_data' => [
                'current_prices' => [
                    'usd' => 20,
                ],
            ],
        ],
    ]);

    $first = Collection::factory()->for($ethereum)->create([
        'volume_7d' => '10', // total: 100
    ]);

    $second = Collection::factory()->for($polygon)->create([
        'volume_7d' => '7', // total: 140
    ]);

    $third = Collection::factory()->for($ethereum)->create([
        'volume_7d' => '11', // total: 110
    ]);

    $collections = Collection::orderByVolume(period: Period::WEEK, currency: CurrencyCode::USD)->get();

    expect($collections->modelKeys())->toBe([
        $second->id, $third->id, $first->id,
    ]);
});

it('can order collections based on the sales volume amount, ignoring the fiat value', function () {
    $ethereum = Network::firstWhere('chain_id', 1);
    $polygon = Network::firstWhere('chain_id', 137);

    $eth = Token::factory()->create([
        'network_id' => $ethereum->id,
        'is_native_token' => true,
        'decimals' => 1,
        'extra_attributes' => [
            'market_data' => [
                'current_prices' => [
                    'usd' => 10,
                ],
            ],
        ],
    ]);

    $matic = Token::factory()->create([
        'network_id' => $polygon->id,
        'is_native_token' => true,
        'decimals' => 1,
        'extra_attributes' => [
            'market_data' => [
                'current_prices' => [
                    'usd' => 20,
                ],
            ],
        ],
    ]);

    $first = Collection::factory()->for($ethereum)->create([
        'volume_7d' => '10',
    ]);

    $second = Collection::factory()->for($polygon)->create([
        'volume_7d' => '7',
    ]);

    $third = Collection::factory()->for($ethereum)->create([
        'volume_7d' => '11',
    ]);

    $collections = Collection::orderByVolume(period: Period::WEEK)->get();

    expect($collections->modelKeys())->toBe([
        $third->id, $first->id, $second->id,
    ]);
});

it('throws an exception when trying to calculate floor price change if the relationship has not been eager loaded', function () {
    $collection = Collection::factory()->create();

    $collection->floorPriceChange();
})->throws(RuntimeException::class);

it('cannot get floor price change if there is no data for today', function () {
    $collection = Collection::factory()->create();

    FloorPriceHistory::factory()->create([
        'collection_id' => $collection->id,
        'retrieved_at' => now()->subDay(1),
    ]);

    expect($collection->load('floorPriceHistory')->floorPriceChange())->toBeNull();
});

it('cannot get floor price change if there is no data for yesterday', function () {
    $collection = Collection::factory()->create();

    FloorPriceHistory::factory()->create([
        'collection_id' => $collection->id,
        'retrieved_at' => now(),
    ]);

    expect($collection->load('floorPriceHistory')->floorPriceChange())->toBeNull();
});

it('can get the change in floor price over the last 24 hours', function () {
    $collection = Collection::factory()->create();

    FloorPriceHistory::factory()->create([
        'collection_id' => $collection->id,
        'floor_price' => '5.5',
        'retrieved_at' => now()->subDays(1),
    ]);

    FloorPriceHistory::factory()->create([
        'collection_id' => $collection->id,
        'floor_price' => '6.2',
        'retrieved_at' => now(),
    ]);

    expect($collection->load('floorPriceHistory')->floorPriceChange())->toBe(12.73);
});

it("can handle divison by zero if yesterday's floor price is 0", function () {
    $collection = Collection::factory()->create();

    FloorPriceHistory::factory()->create([
        'collection_id' => $collection->id,
        'floor_price' => '0',
        'retrieved_at' => now()->subDays(1),
    ]);

    FloorPriceHistory::factory()->create([
        'collection_id' => $collection->id,
        'floor_price' => '6',
        'retrieved_at' => now(),
    ]);

    expect($collection->load('floorPriceHistory')->floorPriceChange())->toBeNull();
});
