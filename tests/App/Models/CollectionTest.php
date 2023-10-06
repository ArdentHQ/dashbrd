<?php

declare(strict_types=1);

use App\Enums\CurrencyCode;
use App\Enums\NftTransferType;
use App\Models\Collection;
use App\Models\CollectionTrait;
use App\Models\Gallery;
use App\Models\Network;
use App\Models\Nft;
use App\Models\NftActivity;
use App\Models\SpamContract;
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
        NftActivity::factory()->for($nft1)->create([
            'type' => $type,
            'timestamp' => $timestamp,
            'recipient' => $wallet->address,
        ]);
    }

    // Create activity for some other wallet...
    NftActivity::factory()->for($nft1)->create([
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
        NftActivity::factory()->for($nft2)->create([
            'type' => $type,
            'timestamp' => $timestamp,
            'recipient' => $wallet->address,
        ]);
    }

    // Create activity for some other wallet...
    NftActivity::factory()->for($nft2)->create([
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
        NftActivity::factory()->for($nft3)->create([
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
        NftActivity::factory()->for($nft4)->create([
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

it('queries the collections for the collection data object', function () {
    $collection1 = Collection::factory()->create([
        'floor_price' => '123456789',
        'extra_attributes' => [
            'image' => 'https://example.com/image.png',
            'banner' => 'https://example.com/banner.png',
            'website' => 'https://example.com',
            'opensea_slug' => 'test-collection',
        ],
    ]);

    // Null attributes
    $collection2 = Collection::factory()->create([
        'floor_price' => '123456789',
        'extra_attributes' => [
            'website' => 'https://example2.com',
        ],
    ]);

    // With nfts
    Collection::factory()
        ->has(Nft::factory()->count(3))
        ->create([
            'floor_price' => '123456789',
            'extra_attributes' => [
                'website' => 'https://example2.com',
            ],
        ]);

    // should not be included
    Nft::factory()->count(2)->create();

    $result = Collection::forCollectionData()->oldest('id')->get()->toArray();

    // +2 because are created by the nft factory
    expect($result)->toHaveCount(3 + 2);

    expect($result[0])->toEqual([
        'id' => $collection1->id,
        'name' => $collection1->name,
        'slug' => $collection1->slug,
        'address' => $collection1->address,
        'chain_id' => $collection1->network->chain_id,
        'floor_price' => strval($collection1->floor_price),
        'floor_price_fiat' => null,
        'floor_price_currency' => strtolower($collection1->floorPriceToken->symbol),
        'floor_price_decimals' => $collection1->floorPriceToken->decimals,
        'image' => 'https://example.com/image.png',
        'banner' => 'https://example.com/banner.png',
        'opensea_slug' => 'test-collection',
        'website' => 'https://example.com',
        'nfts_count' => 0,
    ]);

    expect($result[1])->toEqual([
        'id' => $collection2->id,
        'name' => $collection2->name,
        'slug' => $collection2->slug,
        'address' => $collection2->address,
        'chain_id' => $collection2->network->chain_id,
        'floor_price' => strval($collection2->floor_price),
        'floor_price_fiat' => null,
        'floor_price_currency' => strtolower($collection2->floorPriceToken->symbol),
        'floor_price_decimals' => $collection2->floorPriceToken->decimals,
        'image' => null,
        'banner' => null,
        'opensea_slug' => null,
        'website' => 'https://example2.com',
        'nfts_count' => 0,
    ]);

    expect($result[2]['nfts_count'])->toBe(3);
});

it('queries the nfts count for the user', function () {
    $user = User::factory()->create();

    // With random nfts
    $collection = Collection::factory()
        ->has(Nft::factory()->count(3))
        ->create([
            'floor_price' => '123456789',
            'extra_attributes' => [],
        ]);

    // Should include only these ones
    Nft::factory()
        ->count(2)
        ->for(Wallet::factory()->withUser($user))
        ->create([
            'collection_id' => $collection->id,
        ]);

    $result = Collection::forCollectionData($user)->oldest('id')->get()->toArray();

    expect($result[0]['nfts_count'])->toBe(2);
});

it('gets the floor price for the user currency', function () {
    $user = User::factory()->create([
        'extra_attributes' => [
            'currency' => 'MXN',
        ],
    ]);

    Collection::factory()
        ->has(
            Nft::factory()->for(Wallet::factory()->withUser($user))
        )
        ->create([
            'fiat_value' => [
                'MXN' => 1000,
                'USD' => 50,
            ],
        ]);

    // No value but usd
    Collection::factory()
        ->has(
            Nft::factory()->for(Wallet::factory()->withUser($user))
        )
        ->create([
            'fiat_value' => [
                'USD' => 50,
            ],
        ]);

    // Not included
    Collection::factory()->create();

    $result = Collection::forCollectionData($user)->oldest('id')->get()->toArray();

    expect($result)->toHaveCount(2);

    expect($result[0]['floor_price_fiat'])->toBe('1000');

    // No mxn price
    expect($result[1]['floor_price_fiat'])->toBeNull();
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

    $collections = Collection::factory(2)->create(['network_id' => $network->id]);

    SpamContract::query()->insert([
        'address' => $collections->first()->address,
        'network_id' => $collections->first()->network_id,
    ]);

    $validCollections = Collection::query()->withoutSpamContracts()->get();

    expect($validCollections->count())->toBe(1)
        ->and($validCollections->first()->slug)->toBe($collections[1]->slug);
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

    $notSigned = Wallet::factory()->create();

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

    expect($filtered->count())->toBe(2)
        ->and($filtered->pluck('id')->sort()->toArray())->toEqual([
            $collection1->id,
            $collection4->id,
        ]);

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

it('filters collections whose floor price wasnt fetched in the last hour', function () {
    // fetched one hour ago
    $collection1 = Collection::factory()->create([
        'extra_attributes' => [
            'floor_price_last_fetched_at' => Carbon::now()->subHour()->addMinute(),
        ],
    ]);

    // fetched one hour and 15 minutes ago
    $collection2 = Collection::factory()->create([
        'extra_attributes' => [
            'floor_price_last_fetched_at' => Carbon::now()->subMinutes(75),
        ],
    ]);

    // never fetched
    $collection3 = Collection::factory()->create();

    // fetched now
    $collection4 = Collection::factory()->create([
        'extra_attributes' => [
            'floor_price_last_fetched_at' => Carbon::now(),
        ],
    ]);

    // fetched 30 minutes ago
    $collection5 = Collection::factory()->create([
        'extra_attributes' => [
            'floor_price_last_fetched_at' => Carbon::now()->subMinutes(30),
        ],
    ]);
    // fetched 1 day ago
    $collection6 = Collection::factory()->create([
        'extra_attributes' => [
            'floor_price_last_fetched_at' => Carbon::now()->subDay(),
        ],
    ]);

    $ids = Collection::floorPriceNotFetchedInLastHour()->pluck('id')->toArray();

    expect($ids)->toEqual([
        $collection2->id,
        $collection3->id,
        $collection6->id,
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
