<?php

declare(strict_types=1);

use App\Data\Web3\CollectionActivity;
use App\Enums\NftTransferType;
use App\Jobs\SyncBurnedNfts;
use App\Models\Collection;
use App\Models\Nft;
use App\Models\SpamContract;
use Carbon\Carbon;

beforeEach(function () {
    config([
        'dashbrd.features.activities' => true,
    ]);
});

it('does not run if collection is marked as spam', function () {
    $collection = Collection::factory()->create();

    $nft = Nft::factory()->for($collection)->create([
        'token_number' => '1',
        'burned_at' => null,
    ]);

    SpamContract::create([
        'network_id' => $collection->network_id,
        'address' => $collection->address,
    ]);

    expect($collection->isSpam())->toBeTrue();

    $activity = collect([
        new CollectionActivity(
            contractAddress: $collection->address,
            tokenId: $nft->token_number,
            sender: 'test-sender',
            recipient: 'test-recipient',
            txHash: 'test-tx-hash',
            logIndex: '1',
            type: NftTransferType::Burn,
            timestamp: now(),
            totalNative: 0,
            totalUsd: 0,
            extraAttributes: [],
        )
    ]);

    (new SyncBurnedNfts($collection, $activity))->handle();

    expect($nft->fresh()->burned_at)->toBeNull();
});

it('does not run if activity indexing is disabled', function () {
    config([
        'dashbrd.features.activities' => false,
    ]);

    $collection = Collection::factory()->create();

    $nft = Nft::factory()->for($collection)->create([
        'token_number' => '1',
        'burned_at' => null,
    ]);

    $activity = collect([
        new CollectionActivity(
            contractAddress: $collection->address,
            tokenId: $nft->token_number,
            sender: 'test-sender',
            recipient: 'test-recipient',
            txHash: 'test-tx-hash',
            logIndex: '1',
            type: NftTransferType::Burn,
            timestamp: now(),
            totalNative: 0,
            totalUsd: 0,
            extraAttributes: [],
        )
    ]);

    (new SyncBurnedNfts($collection, $activity))->handle();

    expect($nft->fresh()->burned_at)->toBeNull();
});

it('does not run if collection is blacklisted from indexing activity', function () {
    $collection = Collection::factory()->create();

    config([
        'dashbrd.activity_blacklist' => [
            $collection->address,
        ],
    ]);

    $nft = Nft::factory()->for($collection)->create([
        'token_number' => '1',
        'burned_at' => null,
    ]);

    $activity = collect([
        new CollectionActivity(
            contractAddress: $collection->address,
            tokenId: $nft->token_number,
            sender: 'test-sender',
            recipient: 'test-recipient',
            txHash: 'test-tx-hash',
            logIndex: '1',
            type: NftTransferType::Burn,
            timestamp: now(),
            totalNative: 0,
            totalUsd: 0,
            extraAttributes: [],
        )
    ]);

    (new SyncBurnedNfts($collection, $activity))->handle();

    expect($nft->fresh()->burned_at)->toBeNull();
});

it('updates burn timestamp for nfts', function () {
    $collection = Collection::factory()->create();

    $nft = Nft::factory()->for($collection)->create([
        'token_number' => '1',
        'burned_at' => null,
    ]);

    $otherNft = Nft::factory()->for($collection)->create([
        'token_number' => '2',
        'burned_at' => null,
    ]);

    $activity = collect([
        new CollectionActivity(
            contractAddress: $collection->address,
            tokenId: $nft->token_number,
            sender: 'test-sender',
            recipient: 'test-recipient',
            txHash: 'test-tx-hash',
            logIndex: '1',
            type: NftTransferType::Burn,
            timestamp: Carbon::parse(100000),
            totalNative: 0,
            totalUsd: 0,
            extraAttributes: [],
        ),
        new CollectionActivity(
            contractAddress: $collection->address,
            tokenId: $otherNft->token_number,
            sender: 'test-sender',
            recipient: 'test-recipient',
            txHash: 'test-tx-hash',
            logIndex: '1',
            type: NftTransferType::Burn,
            timestamp: Carbon::parse(200000),
            totalNative: 0,
            totalUsd: 0,
            extraAttributes: [],
        )
    ]);

    (new SyncBurnedNfts($collection, $activity))->handle();

    expect($nft->fresh()->burned_at->timestamp)->toBe(100000);
    expect($otherNft->fresh()->burned_at->timestamp)->toBe(200000);
});

it('logs an error if there are some NFTs that have previously been burned', function () {
    $collection = Collection::factory()->create();

    $nft = Nft::factory()->for($collection)->create([
        'token_number' => '1',
        'burned_at' => null,
    ]);

    $otherNft = Nft::factory()->for($collection)->create([
        'token_number' => '2',
        'burned_at' => now(),
    ]);

    $this->withoutExceptionHandling();

    $activity = collect([
        new CollectionActivity(
            contractAddress: $collection->address,
            tokenId: $nft->token_number,
            sender: 'test-sender',
            recipient: 'test-recipient',
            txHash: 'test-tx-hash',
            logIndex: '1',
            type: NftTransferType::Burn,
            timestamp: Carbon::parse(100000),
            totalNative: 0,
            totalUsd: 0,
            extraAttributes: [],
        ),
        new CollectionActivity(
            contractAddress: $collection->address,
            tokenId: $otherNft->token_number,
            sender: 'test-sender',
            recipient: 'test-recipient',
            txHash: 'test-tx-hash',
            logIndex: '1',
            type: NftTransferType::Burn,
            timestamp: Carbon::parse(200000),
            totalNative: 0,
            totalUsd: 0,
            extraAttributes: [],
        )
    ]);

    (new SyncBurnedNfts($collection, $activity))->handle();

    expect($nft->fresh()->burned_at->timestamp)->toBe(100000);
    expect($otherNft->fresh()->burned_at->timestamp)->toBe(200000);
});

it('has a retry until', function () {
    $collection = Collection::factory()->create();

    expect((new SyncBurnedNfts($collection, collect([])))->retryUntil())->toBeInstanceOf(DateTime::class);
});
