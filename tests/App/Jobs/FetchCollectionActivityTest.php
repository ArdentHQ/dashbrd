<?php

declare(strict_types=1);

use App\Data\Web3\CollectionActivity;
use App\Enums\Chains;
use App\Enums\NftTransferType;
use App\Jobs\FetchCollectionActivity;
use App\Models\Collection;
use App\Models\Network;
use App\Models\NftActivity;
use App\Models\SpamContract;
use App\Services\Web3\Mnemonic\MnemonicWeb3DataProvider;
use Illuminate\Support\Collection as BaseCollection;
use Illuminate\Support\Facades\Bus;

beforeEach(function () {
    config([
        'dashbrd.features.activities' => true,
    ]);
});

it('does not run if collection is marked as spam', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => true,
    ]);

    SpamContract::create([
        'network_id' => $collection->network_id,
        'address' => $collection->address,
    ]);

    expect($collection->isSpam())->toBeTrue();

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getCollectionActivity')->never()
    );

    (new FetchCollectionActivity($collection))->handle($mock);
});

it('does not run if collection is already fetching activity', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => true,
    ]);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getCollectionActivity')->never()
    );

    (new FetchCollectionActivity($collection))->handle($mock);
});

it('does not run if collection is blacklisted from indexing activity', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
    ]);

    config([
        'dashbrd.activity_blacklist' => [
            $collection->address,
        ],
    ]);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getCollectionActivity')->never()
    );

    (new FetchCollectionActivity($collection))->handle($mock);
});

it('does run in forced mode if collection is already fetching activity', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => true,
        'network_id' => Network::polygon()->first()->id,
    ]);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getCollectionActivity')->once()->andReturn(collect([]))
    );

    (new FetchCollectionActivity($collection, forced: true))->handle($mock);
});

it('does not dispatch another job in the chain if there are no activities at all', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->first()->id,
        'activity_updated_at' => null,
    ]);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getCollectionActivity')->once()->andReturn(collect([]))
    );

    (new FetchCollectionActivity($collection))->handle($mock);

    $collection->refresh();

    expect($collection->is_fetching_activity)->toBeFalse();
    expect($collection->activity_updated_at)->not->toBeNull();
});

it('does not dispatch another job in the chain if there are no activities with the proper label', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->first()->id,
        'activity_updated_at' => null,
    ]);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getCollectionActivity')->once()->andReturn(collect([
            new CollectionActivity(
                contractAddress: 'test-address',
                tokenId: '1',
                sender: 'test-sender',
                recipient: 'test-recipient',
                txHash: 'test-tx-hash',
                logIndex: '1',
                type: null,
                timestamp: now(),
                totalNative: 0,
                totalUsd: 0,
                extraAttributes: [],
            ),
        ]))
    );

    (new FetchCollectionActivity($collection))->handle($mock);

    $collection->refresh();

    expect($collection->is_fetching_activity)->toBeFalse();
    expect($collection->activity_updated_at)->not->toBeNull();
});

it('does not dispatch another job in the chain if there are less than 500 activities returned from the provider', function () {
    Bus::fake([FetchCollectionActivity::class]);

    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->first()->id,
        'activity_updated_at' => null,
    ]);

    expect($collection->activities()->count())->toBe(0);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getCollectionActivity')->once()->andReturn(collect([
            new CollectionActivity(
                contractAddress: 'test-address',
                tokenId: '1',
                sender: 'test-sender',
                recipient: 'test-recipient',
                txHash: 'test-tx-hash',
                logIndex: '1',
                type: NftTransferType::Transfer,
                timestamp: now(),
                totalNative: 0,
                totalUsd: 0,
                extraAttributes: [],
            ),
        ]))
    );

    (new FetchCollectionActivity($collection))->handle($mock);

    expect($collection->activities()->count())->toBe(1);

    $collection->refresh();

    expect($collection->is_fetching_activity)->toBeFalse();
    expect($collection->activity_updated_at)->not->toBeNull();

    Bus::assertNothingDispatched();
});

it('does dispatch another job in the chain if there are more than 500 activities returned from the provider', function () {
    Bus::fake([FetchCollectionActivity::class]);

    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->first()->id,
        'activity_updated_at' => null,
    ]);

    expect($collection->activities()->count())->toBe(0);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getCollectionActivity')->once()->andReturn(BaseCollection::times(500, fn ($index) => new CollectionActivity(
            contractAddress: 'test-address',
            tokenId: (string) $index,
            sender: 'test-sender',
            recipient: 'test-recipient',
            txHash: 'test-tx-hash',
            logIndex: (string) $index,
            type: NftTransferType::Transfer,
            timestamp: now(),
            totalNative: 0,
            totalUsd: 0,
            extraAttributes: [],
        )))
    );

    (new FetchCollectionActivity($collection))->handle($mock);

    expect($collection->activities()->count())->toBe(500);

    $collection->refresh();

    expect($collection->is_fetching_activity)->toBeTrue();
    expect($collection->activity_updated_at)->toBeNull();

    Bus::assertDispatched(FetchCollectionActivity::class, fn ($job) => $job->collection->is($collection) && $job->forced);
});

it('starts from the timestamp of the newest activity', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->first()->id,
        'activity_updated_at' => null,
    ]);

    $date = now();

    // Newer...
    $newer = NftActivity::factory()->create([
        'collection_id' => $collection->id,
        'token_number' => 1,
        'timestamp' => $date,
    ]);

    // Older...
    NftActivity::factory()->create([
        'collection_id' => $collection->id,
        'token_number' => 1,
        'timestamp' => $date->copy()->subMinutes(10),
    ]);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getCollectionActivity')->once()->withArgs(function ($chain, $address, $limit, $from) use ($date, $collection) {
            return $chain === Chains::Polygon
                && $address === $collection->address
                && $limit === 500
                && ($from->toDateTimeString() === $date->toDateTimeString());
        })->andReturn(collect([]))
    );

    (new FetchCollectionActivity($collection))->handle($mock);

    $collection->refresh();

    expect($collection->is_fetching_activity)->toBeFalse();
    expect($collection->activity_updated_at)->not->toBeNull();
});

it('ignores activities without any type (label)', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->first()->id,
        'activity_updated_at' => null,
    ]);

    expect($collection->activities()->count())->toBe(0);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getCollectionActivity')->once()->andReturn(collect([
            new CollectionActivity(
                contractAddress: 'test-address',
                tokenId: '1',
                sender: 'test-sender',
                recipient: 'test-recipient',
                txHash: 'test-tx-hash',
                logIndex: '1',
                type: NftTransferType::Transfer,
                timestamp: now(),
                totalNative: 0,
                totalUsd: 0,
                extraAttributes: [],
            ),
            new CollectionActivity(
                contractAddress: 'test-address',
                tokenId: '2',
                sender: 'test-sender',
                recipient: 'test-recipient',
                txHash: 'test-tx-hash',
                logIndex: '1',
                type: null,
                timestamp: now(),
                totalNative: 0,
                totalUsd: 0,
                extraAttributes: [],
            ),
            new CollectionActivity(
                contractAddress: 'test-address',
                tokenId: '3',
                sender: 'test-sender',
                recipient: 'test-recipient',
                txHash: 'test-tx-hash',
                logIndex: '1',
                type: NftTransferType::Transfer,
                timestamp: now(),
                totalNative: 0,
                totalUsd: 0,
                extraAttributes: [],
            ),
        ]))
    );

    (new FetchCollectionActivity($collection))->handle($mock);

    expect($collection->activities()->count())->toBe(2);

    $collection->refresh();

    expect($collection->is_fetching_activity)->toBeFalse();
    expect($collection->activity_updated_at)->not->toBeNull();

    expect($collection->activities()->where('token_number', '2')->exists())->toBeFalse();
});

it('upserts existing activities', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->first()->id,
        'activity_updated_at' => null,
    ]);

    NftActivity::factory()->create([
        'collection_id' => $collection->id,
        'token_number' => 1,
        'type' => NftTransferType::Mint,
        'tx_hash' => 'test-hash',
        'log_index' => '1',
        'sender' => 'old-sender',
    ]);

    expect($collection->activities()->count())->toBe(1);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getCollectionActivity')->once()->andReturn(collect([
            new CollectionActivity(
                contractAddress: 'test-address',
                tokenId: '1',
                sender: 'test-sender',
                recipient: 'test-recipient',
                txHash: 'test-hash',
                logIndex: '1',
                type: NftTransferType::Mint,
                timestamp: now(),
                totalNative: 0,
                totalUsd: 0,
                extraAttributes: [],
            ),
            new CollectionActivity(
                contractAddress: 'test-address',
                tokenId: '2',
                sender: 'test-sender',
                recipient: 'test-recipient',
                txHash: 'test-tx-hash',
                logIndex: '1',
                type: null,
                timestamp: now(),
                totalNative: 0,
                totalUsd: 0,
                extraAttributes: [],
            ),
            new CollectionActivity(
                contractAddress: 'test-address',
                tokenId: '3',
                sender: 'test-sender',
                recipient: 'test-recipient',
                txHash: 'test-tx-hash',
                logIndex: '1',
                type: NftTransferType::Transfer,
                timestamp: now(),
                totalNative: 0,
                totalUsd: 0,
                extraAttributes: [],
            ),
        ]))
    );

    (new FetchCollectionActivity($collection))->handle($mock);

    expect($collection->activities()->count())->toBe(2);

    $collection->refresh();

    expect($collection->is_fetching_activity)->toBeFalse();
    expect($collection->activity_updated_at)->not->toBeNull();

    $activity = $collection->activities()->where([
        'token_number' => 1,
        'type' => NftTransferType::Mint,
        'tx_hash' => 'test-hash',
    ])->first();

    expect($activity->sender)->toBe('test-sender');
    expect($activity->recipient)->toBe('test-recipient');
});

it('has a retry until', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->first()->id,
        'activity_updated_at' => null,
    ]);

    expect((new FetchCollectionActivity($collection))->retryUntil())->toBeInstanceOf(DateTime::class);
});

it('resets the collection state if the job fails', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => true,
        'activity_updated_at' => null,
    ]);

    (new FetchCollectionActivity($collection))->onFailure(new RuntimeException);

    $collection->refresh();

    expect($collection->is_fetching_activity)->toBeFalse();
    expect($collection->activity_updated_at)->not->toBeNull();
});
