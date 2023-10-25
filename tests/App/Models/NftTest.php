<?php

declare(strict_types=1);

use App\Data\ImagesData;
use App\Enums\NftTransferType;
use App\Enums\TraitDisplayType;
use App\Models\Collection;
use App\Models\CollectionTrait;
use App\Models\Gallery;
use App\Models\Nft;
use App\Models\NftActivity;
use App\Models\Wallet;
use App\Support\Web3NftHandler;
use Carbon\Carbon;

it('can create a basic nft', function () {
    $nft = Nft::factory()->create();

    expect($nft->name)->not()->toBeNull();
});

it('can retrieve galleries the nft belongs to', function () {
    $nft = Nft::factory()->create();
    $gallery = Gallery::factory()->create();

    expect($nft->galleries()->count())->toBe(0);

    $gallery->nfts()->attach($nft->id, ['order_index' => 1]);

    expect($nft->galleries()->count())->toBe(1);
});

it('can retrieve the collection the nft belongs to', function () {
    $collection = Collection::factory()->create();

    $nft = Nft::factory()->create([
        'collection_id' => $collection->id,
    ]);

    expect($nft->collection->id)->toBe($collection->id);
});

it('can get token images', function () {
    $nft = Nft::factory()->create([
        'extra_attributes' => [
            'images' => [
                'thumb' => 'https://example.com/thumb.png',
                'small' => 'https://example.com/small.png',
                'large' => 'https://example.com/large.png',
            ],
        ],
    ]);

    expect($nft->images())->toEqual(
        [
            'thumb' => 'https://example.com/thumb.png',
            'small' => 'https://example.com/small.png',
            'large' => 'https://example.com/large.png',
            'original' => null,
            'originalRaw' => null,
        ]
    );
});

it('can get ImagesData from images', function () {
    $nft = Nft::factory()->create([
        'extra_attributes' => [
            'images' => [
                'thumb' => 'https://example.com/thumb.png',
                'small' => 'https://example.com/small.png',
                'large' => 'https://example.com/large.png',
            ],
        ],
    ]);

    $images = ImagesData::from($nft->images());

    expect($images->thumb)
        ->toEqual('https://example.com/thumb.png')
        ->and($images->small)
        ->toEqual('https://example.com/small.png')
        ->and($images->large)
        ->toEqual('https://example.com/large.png');
});

it('can attach traits', function () {
    [$nft1, $nft2] = Nft::factory(2)->create();

    $traits = [
        CollectionTrait::factory(2)->create(['collection_id' => $nft1['collection_id']]),
        CollectionTrait::factory(4)->create(['collection_id' => $nft2['collection_id']]),
    ];

    $nft1->traits()->attach($traits[0]);
    $nft2->traits()->attach($traits[1]);

    expect($nft1->traits()->count())->toBe(2)
        ->and($nft2->traits()->count())->toBe(4);
});

it('can filter owned', function () {
    $user = createUser();

    $userWallet = Wallet::factory()->create([
        'user_id' => $user->id,
    ]);

    $userWallet2 = Wallet::factory()->create([
        'user_id' => $user->id,
    ]);

    $owned1 = Nft::factory(2)->create(['wallet_id' => $userWallet]);

    Nft::factory(1)->create();

    $owned2 = Nft::factory(1)->create(['wallet_id' => $userWallet2]);

    expect(Nft::ownedBy($user)->count())->toBe(3);

    expect(Nft::ownedBy($user)->get()->pluck('id'))->toEqualCanonicalizing(
        collect($owned1)->merge($owned2)->pluck('id')
    );
});

it('can filter by traits', function () {
    [$nft1, $nft2, $nft3] = Nft::factory(3)->create();

    $traits = [
        CollectionTrait::factory(2)->create(['collection_id' => $nft1['collection_id'], 'display_type' => TraitDisplayType::Stat->value, 'value' => Web3NftHandler::$numericTraitPlaceholder]),
        CollectionTrait::factory(3)->create(['collection_id' => $nft2['collection_id'], 'display_type' => TraitDisplayType::Date->value, 'value' => Carbon::now()->toDateString()]),
        CollectionTrait::factory(4)->create(['collection_id' => $nft2['collection_id'], 'display_type' => TraitDisplayType::Property->value, 'value' => 'TEST']),
    ];

    $nft1->traits()->attach($traits[0], ['value_numeric' => '12345']);
    $nft2->traits()->attach($traits[1], ['value_date' => $traits[1]->first()->value]);
    $nft3->traits()->attach($traits[2], ['value_string' => $traits[2]->first()->value]);

    expect(Nft::withTraits([
        $traits[0]->first()->name => [
            TraitDisplayType::Stat->value => ['12345'],
        ],
    ])->count())->toBe(1);

    expect(Nft::withTraits([
        $traits[0]->first()->name => [
            TraitDisplayType::Stat->value => ['12345'],
        ],
    ])->first()->id)->toBe($nft1->id);

    expect(Nft::withTraits([
        $traits[1]->first()->name => [
            TraitDisplayType::Date->value => [$traits[1]->first()->value],
        ],
    ])->count())->toBe(1);

    expect(Nft::withTraits([
        $traits[1]->first()->name => [
            TraitDisplayType::Date->value => [$traits[1]->first()->value],
        ],
    ])->first()->id)->toBe($nft2->id);

    expect(Nft::withTraits([
        $traits[2]->first()->name => [
            TraitDisplayType::Property->value => [$traits[2]->first()->value],
        ],
    ])->count())->toBe(1);

    expect(Nft::withTraits([
        $traits[2]->first()->name => [
            TraitDisplayType::Property->value => [$traits[2]->first()->value],
        ],
    ])->first()->id)->toBe($nft3->id);

    expect(Nft::withTraits([
        $traits[0]->first()->name => [
            TraitDisplayType::Stat->value => ['56789'],
        ],
    ])->count())->toBe(0);

    expect(Nft::withTraits([
        $traits[1]->first()->name => [
            TraitDisplayType::Date->value => ['2011-1-1'],
        ],
    ])->count())->toBe(0);

    expect(Nft::withTraits([
        $traits[2]->first()->name => [
            TraitDisplayType::Property->value => ['asdffgg'],
        ],
    ])->count())->toBe(0);
});

it('ignores the traits filter if empty values', function () {
    [$nft1, $nft2] = Nft::factory(2)->create();

    $traits = [
        CollectionTrait::factory(2)->create(['collection_id' => $nft1['collection_id']]),
        CollectionTrait::factory(4)->create(['collection_id' => $nft2['collection_id']]),
    ];

    $nft1->traits()->attach($traits[0]);
    $nft2->traits()->attach($traits[1]);

    expect(Nft::withTraits([
        $traits[0]->first()->name => [],
        $traits[1]->first()->name => [],
    ])->count())->toBe(2);
});

it('can filter by filter array', function () {
    $user = createUser();

    $userWallet = Wallet::factory()->create([
        'user_id' => $user->id,
    ]);

    $nft1 = Nft::factory()->create([
        'wallet_id' => $userWallet->id,
    ]);

    $nft2 = Nft::factory()->create();

    $trait1 = CollectionTrait::factory()->create(['collection_id' => $nft1['collection_id'], 'display_type' => TraitDisplayType::Property->value, 'value' => 'TEST1']);
    $nft1->traits()->attach($trait1, ['value_string' => $trait1->value]);

    $trait2 = CollectionTrait::factory()->create(['collection_id' => $nft2['collection_id'], 'display_type' => TraitDisplayType::Property->value, 'value' => 'TEST2']);
    $nft2->traits()->attach($trait2, ['value_string' => $trait2->value]);

    expect(Nft::filter([
        'owned' => true,
        'traits' => null,
    ], $user)->count())->toBe(1);

    expect(Nft::filter([
        'owned' => true,
        'traits' => null,
    ], $user)->first()->id)->toBe($nft1->id);

    // Owned and with trait 1
    expect(Nft::filter([
        'owned' => true,
        'traits' => [$trait1->name => [
            TraitDisplayType::Property->value => [$trait1->value],
        ]],
    ], $user)->count())->toBe(1);

    // not owned (meaning all) and with trait 1
    expect(Nft::filter([
        'owned' => false,
        'traits' => [$trait1->name => [
            TraitDisplayType::Property->value => [$trait1->value],
        ]],
    ], $user)->count())->toBe(1);

    // owned With trait 2
    expect(Nft::filter([
        'owned' => true,
        'traits' => [$trait2->name => [
            TraitDisplayType::Property->value => [$trait2->value],
        ]],
    ], $user)->count())->toBe(0);
});

it('can order nfts by mint date', function () {
    $nft1 = Nft::factory()->create(); // ID: 19

    foreach ([
        NftTransferType::Transfer->value => 1, // timestamp = 1
        NftTransferType::Mint->value => 3, // timestamp = 3
        NftTransferType::Sale->value => 5, // timestamp = 5
    ] as $type => $timestamp) {
        NftActivity::factory()->create([
            'collection_id' => $nft1->collection_id,
            'token_number' => $nft1->token_number,
            'type' => $type,
            'timestamp' => $timestamp,
        ]);
    }

    $nft2 = Nft::factory()->create(); // ID: 20
    foreach ([
        NftTransferType::Transfer->value => 2, // timestamp = 2
        NftTransferType::Mint->value => 4, // timestamp = 4
        NftTransferType::Sale->value => 6, // timestamp = 6
    ] as $type => $timestamp) {
        NftActivity::factory()->create([
            'collection_id' => $nft2->collection_id,
            'token_number' => $nft2->token_number,
            'type' => $type,
            'timestamp' => $timestamp,
        ]);
    }

    $nft3 = Nft::factory()->create(); // ID: 21
    foreach ([
        NftTransferType::Transfer->value => 7, // timestamp = 7
        NftTransferType::Mint->value => 2, // timestamp = 3
        NftTransferType::Sale->value => 1, // timestamp = 1
    ] as $type => $timestamp) {
        NftActivity::factory()->create([
            'collection_id' => $nft3->collection_id,
            'token_number' => $nft3->token_number,
            'type' => $type,
            'timestamp' => $timestamp,
        ]);
    }

    $nfts = Nft::orderByMintDate('desc')->get();

    expect($nfts->modelKeys())->toBe([
        $nft2->id, $nft1->id, $nft3->id,
    ]);

    $nfts = Nft::orderByMintDate('asc')->get();

    expect($nfts->modelKeys())->toBe([
        $nft3->id, $nft1->id, $nft2->id,
    ]);
});

it('can order nfts by received date', function () {
    $nft1 = Nft::factory()->create();

    foreach ([
        NftTransferType::Transfer->value => 1, // timestamp = 1
        NftTransferType::Mint->value => 3, // timestamp = 3
        NftTransferType::Sale->value => 5, // timestamp = 5
    ] as $type => $timestamp) {
        NftActivity::factory()->create([
            'collection_id' => $nft1->collection_id,
            'token_number' => $nft1->token_number,
            'type' => $type,
            'timestamp' => $timestamp,
        ]);
    }

    $nft2 = Nft::factory()->create();
    foreach ([
        NftTransferType::Transfer->value => 2, // timestamp = 2
        NftTransferType::Mint->value => 4, // timestamp = 4
        NftTransferType::Sale->value => 6, // timestamp = 6
    ] as $type => $timestamp) {
        NftActivity::factory()->create([
            'collection_id' => $nft2->collection_id,
            'token_number' => $nft2->token_number,
            'type' => $type,
            'timestamp' => $timestamp,
        ]);
    }

    $nft3 = Nft::factory()->create();
    foreach ([
        NftTransferType::Transfer->value => 7, // timestamp = 7
        NftTransferType::Mint->value => 2, // timestamp = 3
        NftTransferType::Sale->value => 1, // timestamp = 1
    ] as $type => $timestamp) {
        NftActivity::factory()->create([
            'collection_id' => $nft3->collection_id,
            'token_number' => $nft3->token_number,
            'type' => $type,
            'timestamp' => $timestamp,
        ]);
    }

    $nfts = Nft::orderByReceivedDate('desc')->get();

    expect($nfts->modelKeys())->toBe([
        $nft3->id, $nft2->id, $nft1->id,
    ]);

    $nfts = Nft::orderByReceivedDate('asc')->get();

    expect($nfts->modelKeys())->toBe([
        $nft1->id, $nft2->id, $nft3->id,
    ]);
});

it('filters the collections by collection name', function () {
    $nft1 = Nft::factory()->create(['name' => 'NFT 1']);

    $nft2 = Nft::factory()->create(['name' => 'NFT 2']);

    $nft3 = Nft::factory()->create(['name' => 'Test']);

    expect(Nft::search('Test')->count())->toBe(1)
        ->and(Nft::search('NFT')->count())->toBe(2)
        ->and(Nft::search('Test')->get()->pluck('id')->toArray()[0])->toBe($nft3->id)
        ->and(Nft::search('NFT')->get()->pluck('id')->toArray())->toEqualCanonicalizing([$nft1->id, $nft2->id]);
});

it('has activity', function () {
    $first = Nft::factory()->create([
        'token_number' => 1,
    ]);

    $second = Nft::factory()->create([
        'collection_id' => $first->collection_id,
        'token_number' => 2,
    ]);

    $third = Nft::factory()->create([
        'token_number' => 1,
    ]);

    $activity1 = NftActivity::factory()->create([
        'collection_id' => $first->collection_id,
        'token_number' => 1,
    ]);

    $activity2 = NftActivity::factory()->create([
        'collection_id' => $first->collection_id,
        'token_number' => 1,
    ]);

    $activity3 = NftActivity::factory()->create([
        'collection_id' => $first->collection_id,
        'token_number' => 2,
    ]);

    $activity4 = NftActivity::factory()->create([
        'collection_id' => $third->collection_id,
        'token_number' => 1,
    ]);

    $activity5 = NftActivity::factory()->create([
        'collection_id' => $third->collection_id,
        'token_number' => 2,
    ]);

    expect($first->activities()->count())->toBe(2);
    expect($first->activities->modelKeys())->toContain($activity1->id);
    expect($first->activities->modelKeys())->toContain($activity2->id);

    expect($second->activities()->count())->toBe(1);
    expect($second->activities->modelKeys())->toContain($activity3->id);

    expect($third->activities()->count())->toBe(1);
    expect($third->activities->modelKeys())->toContain($activity4->id);
});
