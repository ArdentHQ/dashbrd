<?php

declare(strict_types=1);

use App\Jobs\Middleware\RecoverProviderErrors;
use App\Jobs\RefreshNftMetadata;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;
use App\Models\SpamContract;
use App\Services\Web3\Alchemy\AlchemyWeb3DataProvider;
use App\Support\CryptoUtils;
use App\Support\Facades\Alchemy;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;

it('should refresh NFT metadata', function () {
    Bus::fake();
    $user = createUser();

    $network = Network::polygon();
    $collection = Collection::factory()->create(['network_id' => $network->id]);
    $now = now();

    Nft::factory()->create([
        'wallet_id' => $user->wallet,
        'collection_id' => $collection,
        'metadata_fetched_at' => null,
        'metadata_requested_at' => $now,
    ]);

    expect(Nft::whereNotNull('metadata_fetched_at')->get())->toHaveCount(0);

    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v3/*' => Http::response(fixtureData('alchemy.nft_batch_metadata_2'), 200),
    ]);

    (new RefreshNftMetadata($collection))->handle(app(AlchemyWeb3DataProvider::class));

    expect(Nft::whereNotNull('metadata_fetched_at')->get())->toHaveCount(1);
});

it('should not refresh NFT metadata if not requested', function () {
    Bus::fake();
    $user = createUser();

    $network = Network::polygon();
    $collection = Collection::factory()->create(['network_id' => $network->id]);
    $now = now();

    Nft::factory()->create([
        'wallet_id' => $user->wallet,
        'collection_id' => $collection,
        'metadata_fetched_at' => null,
        'metadata_requested_at' => null,
    ]);

    expect(Nft::whereNotNull('metadata_fetched_at')->get())->toHaveCount(0);

    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::response(fixtureData('alchemy.nft_batch_metadata_2'), 200),
    ]);

    (new RefreshNftMetadata($collection))->handle(app(AlchemyWeb3DataProvider::class));

    expect(Nft::whereNotNull('metadata_fetched_at')->get())->toHaveCount(0);
});

it('should not refresh NFT metadata for NFTs that were previously burned', function () {
    Bus::fake();
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->for($network)->create();

    $nft = Nft::factory()->create([
        'wallet_id' => $user->wallet,
        'collection_id' => $collection,
        'metadata_fetched_at' => null,
        'metadata_requested_at' => now(),
        'burned_at' => now(),
    ]);

    Alchemy::fake();

    (new RefreshNftMetadata($collection))->handle(app(AlchemyWeb3DataProvider::class));

    Alchemy::assertNothingSent();

    expect($nft->fresh()->metadata_fetched_at)->toBeNull();
});

it('should skip refreshing NFT metadata for a spam collection', function () {
    $network = Network::polygon();

    $collectionAddress = '0x000000000a42c2791eec307fff43fa5c640e3ef7';

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'address' => $collectionAddress,
        'name' => 'Unrevealed Collection',
    ]);

    SpamContract::query()->insert([
        'address' => $collectionAddress,
        'network_id' => $network->id,
    ]);

    $nft = Nft::factory()->create([
        'token_number' => '8304',
        'collection_id' => $collection->id,
        'name' => 'Unrevealed NFT',
    ]);

    expect($collection['name'])->toEqual('Unrevealed Collection')
        ->and($nft['name'])->toEqual('Unrevealed NFT');

    (new RefreshNftMetadata($collection, $nft))->handle(app(AlchemyWeb3DataProvider::class));

    expect($collection->fresh()['name'])->toEqual('Unrevealed Collection')
        ->and($nft->fresh()['name'])->toEqual('Unrevealed NFT');

    Alchemy::assertNothingSent();
});

it('should use the nft id as a unique job identifier', function () {
    $user = createUser();
    $network = Network::polygon();
    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'address' => '0x23581767a106ae21c074b2276d25e5c3e136a68b',
        'name' => 'Unrevealed Collection',
    ]);

    /** @var Nft $nft */
    $nft = Nft::factory()->create([
        'name' => 'Unrevealed Token',
        'token_number' => CryptoUtils::hexToBigIntStr('0x0000000000000000000000000000000000000000000000000000000000000000'),
        'wallet_id' => $user->wallet_id,
        'collection_id' => $collection->id,
    ]);

    expect((new RefreshNftMetadata($collection, $nft))->uniqueId())->toBeString();
});

it('should return rate limited middleware', function () {
    $collection = Collection::factory()->create();
    $nft = Nft::factory()->create();

    $middleware = (new RefreshNftMetadata($collection, $nft))->middleware();

    expect($middleware)->toHaveCount(2)
        ->and($middleware[0])->toBeInstanceOf(RateLimited::class)
        ->and($middleware[1])->toBeInstanceOf(RecoverProviderErrors::class);
});

it('has a retry until', function () {
    $collection = Collection::factory()->create();
    $nft = Nft::factory()->create();

    $job = new RefreshNftMetadata($collection, $nft);

    expect($job->retryUntil())->toBeInstanceOf(DateTime::class);
});
