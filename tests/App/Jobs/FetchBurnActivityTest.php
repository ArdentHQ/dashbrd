<?php

declare(strict_types=1);

use App\Data\Web3\CollectionActivity;
use App\Enums\Chain;
use App\Enums\NftTransferType;
use App\Jobs\FetchBurnActivity;
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
        'activity_updated_at' => now(),
    ]);

    SpamContract::create([
        'network_id' => $collection->network_id,
        'address' => $collection->address,
    ]);

    expect($collection->isSpam())->toBeTrue();

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getBurnActivity')->never()
    );

    (new FetchBurnActivity($collection))->handle($mock);
});

it('does not run if collection has never ran the initial activity fetching', function () {
    $collection = Collection::factory()->create([
        'activity_updated_at' => null,
    ]);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getBurnActivity')->never()
    );

    (new FetchBurnActivity($collection))->handle($mock);
});

it('does not run if collection is blacklisted from indexing activity', function () {
    $collection = Collection::factory()->create([
        'activity_updated_at' => now(),
    ]);

    config([
        'dashbrd.activity_blacklist' => [
            $collection->address,
        ],
    ]);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getBurnActivity')->never()
    );

    (new FetchBurnActivity($collection))->handle($mock);
});

it('does not dispatch another job in the chain if there are no activities at all', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->id,
        'activity_updated_at' => now(),
    ]);

    Bus::fake();

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getBurnActivity')->once()->andReturn(collect([]))
    );

    (new FetchBurnActivity($collection))->handle($mock);

    Bus::assertNothingDispatched();
});

it('does not dispatch another job in the chain if there are less than 500 burn activities returned from the provider', function () {
    Bus::fake([FetchBurnActivity::class]);

    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->id,
        'activity_updated_at' => now(),
    ]);

    expect($collection->activities()->count())->toBe(0);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getBurnActivity')->once()->andReturn(collect([
            new CollectionActivity(
                contractAddress: 'test-address',
                tokenId: '1',
                sender: 'test-sender',
                recipient: 'test-recipient',
                txHash: 'test-tx-hash',
                logIndex: '1',
                type: NftTransferType::Burn,
                timestamp: now(),
                totalNative: 0,
                totalUsd: 0,
                extraAttributes: [],
            ),
        ]))
    );

    (new FetchBurnActivity($collection))->handle($mock);

    expect($collection->activities()->count())->toBe(1);

    Bus::assertNothingDispatched();
});

it('does dispatch another job in the chain if there are more than 500 activities returned from the provider', function () {
    Bus::fake([FetchBurnActivity::class]);

    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->id,
        'activity_updated_at' => now(),
    ]);

    expect($collection->activities()->count())->toBe(0);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getBurnActivity')->once()->andReturn(BaseCollection::times(500, fn ($index) => new CollectionActivity(
            contractAddress: 'test-address',
            tokenId: (string) $index,
            sender: 'test-sender',
            recipient: 'test-recipient',
            txHash: 'test-tx-hash',
            logIndex: (string) $index,
            type: NftTransferType::Burn,
            timestamp: now(),
            totalNative: 0,
            totalUsd: 0,
            extraAttributes: [],
        )))
    );

    (new FetchBurnActivity($collection))->handle($mock);

    expect($collection->activities()->count())->toBe(500);

    Bus::assertDispatched(FetchBurnActivity::class, fn ($job) => $job->collection->is($collection) && ! $job->isFirstRun);
});

it('starts from the timestamp of the newest burn activity', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->id,
        'activity_updated_at' => now(),
    ]);

    $date = now();

    // Newer...
    $newer = NftActivity::factory()->create([
        'collection_id' => $collection->id,
        'token_number' => 1,
        'timestamp' => $date,
        'type' => NftTransferType::Burn,
    ]);

    // Older...
    NftActivity::factory()->create([
        'collection_id' => $collection->id,
        'token_number' => 1,
        'timestamp' => $date->copy()->subMinutes(10),
        'type' => NftTransferType::Burn,
    ]);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getBurnActivity')->once()->withArgs(function ($chain, $address, $limit, $from) use ($date, $collection) {
            return $chain === Chain::Polygon
                && $address === $collection->address
                && $limit === 500
                && ($from->toDateTimeString() === $date->toDateTimeString());
        })->andReturn(collect([]))
    );

    (new FetchBurnActivity($collection, isFirstRun: false))->handle($mock);
});

it('does not dispatch another job in the chain if there are no activities with the proper label', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->id,
        'activity_updated_at' => now(),
    ]);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getBurnActivity')->once()->andReturn(collect([
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

    Bus::fake();

    (new FetchBurnActivity($collection))->handle($mock);

    Bus::assertNothingDispatched();
});

it('ignores activities without any type (label)', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->id,
        'activity_updated_at' => now(),
    ]);

    expect($collection->activities()->count())->toBe(0);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getBurnActivity')->once()->andReturn(collect([
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
                type: NftTransferType::Burn,
                timestamp: now(),
                totalNative: 0,
                totalUsd: 0,
                extraAttributes: [],
            ),
        ]))
    );

    (new FetchBurnActivity($collection))->handle($mock);

    expect($collection->activities()->count())->toBe(1);

    $collection->refresh();

    expect($collection->activities()->where('token_number', '2')->exists())->toBeFalse();
});

it('upserts existing activities', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->id,
        'activity_updated_at' => now(),
    ]);

    NftActivity::factory()->create([
        'collection_id' => $collection->id,
        'token_number' => 1,
        'type' => NftTransferType::Burn,
        'tx_hash' => 'test-hash',
        'log_index' => '1',
        'sender' => 'old-sender',
    ]);

    expect($collection->activities()->count())->toBe(1);

    $mock = $this->mock(
        MnemonicWeb3DataProvider::class,
        fn ($mock) => $mock->shouldReceive('getBurnActivity')->once()->andReturn(collect([
            new CollectionActivity(
                contractAddress: 'test-address',
                tokenId: '1',
                sender: 'test-sender',
                recipient: 'test-recipient',
                txHash: 'new-hash',
                logIndex: '1',
                type: NftTransferType::Burn,
                timestamp: now(),
                totalNative: 0,
                totalUsd: 0,
                extraAttributes: [],
            ),
        ]))
    );

    (new FetchBurnActivity($collection))->handle($mock);

    expect($collection->activities()->count())->toBe(2);
});

it('has a retry until', function () {
    $collection = Collection::factory()->create([
        'is_fetching_activity' => false,
        'network_id' => Network::polygon()->id,
        'activity_updated_at' => null,
    ]);

    expect((new FetchBurnActivity($collection))->retryUntil())->toBeInstanceOf(DateTime::class);
});
