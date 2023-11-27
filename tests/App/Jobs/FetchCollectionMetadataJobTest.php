<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionMetadataJob;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Alchemy;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

it('should update nft collection metadata', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v3/*/getContractMetadataBatch' => Http::response(fixtureData('alchemy.contract_metadata_batch'), 200),
    ]);

    $now = Carbon::now();
    Carbon::setTestNow($now);

    $network = Network::polygon()->firstOrFail();

    /** @var Collection $collection */
    $collection = Collection::factory()->create([
        'address' => '0xe785E82358879F061BC3dcAC6f0444462D4b5330',
        'network_id' => $network->id,
        'supply' => 8000,
        'minted_block' => 12907765,
        'extra_attributes' => [
            'banner' => null,
            'image' => 'image-url',
        ],
    ]);

    (new FetchCollectionMetadataJob([$collection->address], $network))->handle();

    $collection->refresh();

    $updatedAt = Carbon::parse($collection->bannerUpdatedAt());

    expect($collection->name)->toBe('World Of Women')
        ->and($collection->supply)->toBe(10000)
        ->and($collection->minted_block)->toBe(12907782)
        ->and($collection->description)->toBe('World of Women is a collection of 10,000 NFTs.')
        ->and($updatedAt->timestamp)->toBe($now->timestamp)
        ->and($collection->image())->toBe('image-url')
        ->and($collection->openSeaSlug())->toBe('world-of-women-nft')
        ->and($collection->banner())->toBe('https://i.seadn.io/gae/GHhptRLebBOWOy8kfXpYCVqsqdes-1-6I_jbuRnGTHHW6TD63CtciH75Dotfu2u8v6EmkWt-tjhkFRVLxRUwgMfKqqy5W24AolJayeo?w=500&auto=format');
});

it('should skip updating column if metadata is null', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v3/*/getContractMetadataBatch' => Http::response(fixtureData('alchemy.contract_metadata_batch'), 200),
    ]);

    $network = Network::polygon()->firstOrFail();

    /** @var Collection $collection */
    $collection = Collection::factory()->create([
        'address' => '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        'network_id' => $network->id,
        'supply' => 8000,
        'floor_price' => 80000000,
        'description' => 'hello',
        'extra_attributes' => [
            'banner' => null,
        ],
    ]);

    (new FetchCollectionMetadataJob([$collection->address], $network))->handle();

    $collection->refresh();

    expect($collection->banner())->toBeNull()
        ->and($collection->supply)->toBe(10000)
        ->and($collection->description)->toBe('hello');
});

it('should use the collection addresses and network id as a unique job identifier', function () {
    $network = Network::polygon()->firstOrFail();

    $collection1 = Collection::factory()->create([
        'address' => '0xbhello',
        'network_id' => $network->id,
    ]);

    $collection2 = Collection::factory()->create([
        'address' => '0xahello',
        'network_id' => $network->id,
    ]);

    $uniqueId = (new FetchCollectionMetadataJob([$collection1->address, $collection2->address], $network))->uniqueId();

    expect($uniqueId)->toBe(FetchCollectionMetadataJob::class.':'.$network->chain_id.'-0xahello-0xbhello');
});

it('has a retry limit', function () {
    $network = Network::polygon()->firstOrFail();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    expect((new FetchCollectionMetadataJob([$collection->address], $network))->retryUntil())->toBeInstanceOf(DateTime::class);
});
