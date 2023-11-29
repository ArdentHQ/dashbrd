<?php

declare(strict_types=1);

use App\Data\Web3\Web3NftData;
use App\Data\Web3\Web3NftsChunk;
use App\Enums\TokenType;
use App\Jobs\UpdateNftDescription;
use App\Models\Network;
use App\Models\Nft;
use App\Services\Web3\Alchemy\AlchemyWeb3DataProvider;
use Illuminate\Support\Facades\Bus;

it('updates the description and dispatches the next job', function () {
    $network = Network::factory()->create();

    $nft = Nft::factory()->recycle($network)->create([
        'description' => 'original-1',
    ]);

    $other = Nft::factory()->recycle($network)->create([
        'description' => 'original-2',
    ]);

    $job = new UpdateNftDescription($nft->id, $network);

    Bus::fake();

    $mock = $this->mock(AlchemyWeb3DataProvider::class, function ($mock) use ($nft, $other, $network) {
        $mock->shouldReceive('getNftMetadata')->andReturn(new Web3NftsChunk(
            nextToken: null,
            nfts: collect([
                new Web3NftData(
                    tokenAddress: $nft->collection->address,
                    tokenNumber: $nft->token_number,
                    networkId: $network->id,
                    collectionName: 'TEST',
                    collectionSymbol: 'TEST',
                    collectionImage: null,
                    collectionWebsite: null,
                    collectionDescription: null,
                    collectionBannerImageUrl: null,
                    collectionBannerUpdatedAt: null,
                    collectionOpenSeaSlug: null,
                    collectionSocials: null,
                    collectionSupply: null,
                    name: 'Test',
                    description: 'updated-1',
                    extraAttributes: [],
                    floorPrice: null,
                    traits: [],
                    mintedBlock: 1000,
                    mintedAt: null,
                    hasError: false,
                    info: null,
                    type: TokenType::Erc721,
                ),
                new Web3NftData(
                    tokenAddress: $other->collection->address,
                    tokenNumber: $other->token_number,
                    networkId: $network->id,
                    collectionName: 'TEST2',
                    collectionSymbol: 'TEST2',
                    collectionImage: null,
                    collectionWebsite: null,
                    collectionDescription: null,
                    collectionBannerImageUrl: null,
                    collectionBannerUpdatedAt: null,
                    collectionOpenSeaSlug: null,
                    collectionSocials: null,
                    collectionSupply: null,
                    name: 'Test 2',
                    description: 'updated-2',
                    extraAttributes: [],
                    floorPrice: null,
                    traits: [],
                    mintedBlock: 1000,
                    mintedAt: null,
                    hasError: false,
                    info: null,
                    type: TokenType::Erc721,
                ),
            ])
        ));
    });

    $job->handle($mock);

    expect($nft->fresh()->description)->toBe('updated-1');
    expect($other->fresh()->description)->toBe('updated-2');

    Bus::assertDispatched(UpdateNftDescription::class, function ($job) use ($network, $other) {
        return $network->is($job->network) && $job->startId === $other->id + 1;
    });
});

it('runs the job for the next network if no more nfts left in the current network', function () {
    $network = Network::factory()->create([
        'is_mainnet' => true,
    ]);

    $newNetwork = Network::factory()->create([
        'is_mainnet' => true,
    ]);

    $nft = Nft::factory()->recycle($network)->create([
        'description' => 'original-1',
    ]);

    $other = Nft::factory()->recycle($network)->create([
        'description' => 'original-2',
    ]);

    $job = new UpdateNftDescription($other->id + 1, $network);

    Bus::fake();

    $job->handle(app(AlchemyWeb3DataProvider::class));

    Bus::assertDispatched(UpdateNftDescription::class, function ($job) use ($newNetwork) {
        return $newNetwork->is($job->network) && $job->startId === 1;
    });
});

it('ends the job if there are no nfts and no new networks', function () {
    $latestNetwork = Network::latest('id')->first();

    $job = new UpdateNftDescription(1, $latestNetwork);

    Bus::fake();

    $job->handle(app(AlchemyWeb3DataProvider::class));

    Bus::assertNothingDispatched();
});

it('has a retry until', function () {
    $network = Network::factory()->create();

    $nft = Nft::factory()->recycle($network)->create();

    $job = new UpdateNftDescription($nft->id, $network);

    expect($job->retryUntil())->toBeInstanceOf(DateTime::class);
});

it('has a unique ID', function () {
    $network = Network::factory()->create();

    $nft = Nft::factory()->recycle($network)->create();

    $job = new UpdateNftDescription($nft->id, $network);

    expect($job->uniqueId())->toBeString();
});
