<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionBannerBatch;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Alchemy;
use Illuminate\Support\Facades\Http;

it('should fetch nft collection banner', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*/getContractMetadataBatch' => Http::response(fixtureData('alchemy.contract-metadata-batch'), 200),
    ]);

    $network = Network::polygon()->firstOrFail();

    /** @var Collection $collection */
    $collection = Collection::factory()->create([
        'address' => '0xe785e82358879f061bc3dcac6f0444462d4b5330',
        'network_id' => $network->id,
        'extra_attributes' => [
            'banner' => null
        ],
    ]);

    expect($collection->banner())->toBeNull();

    (new FetchCollectionBannerBatch([$collection->address], $network))->handle();

    $collection->refresh();

    expect($collection->banner())->toBe('https://i.seadn.io/gae/GHhptRLebBOWOy8kfXpYCVqsqdes-1-6I_jbuRnGTHHW6TD63CtciH75Dotfu2u8v6EmkWt-tjhkFRVLxRUwgMfKqqy5W24AolJayeo?w=500&auto=format');
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

    $uniqueId = (new FetchCollectionBannerBatch([$collection1->address, $collection2->address], $network))->uniqueId();

    expect($uniqueId)->toBe(FetchCollectionBannerBatch::class.':'.$network->chain_id.'-0xahello-0xbhello');
});

it('has a retry limit', function () {
    $network = Network::polygon()->firstOrFail();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    expect((new FetchCollectionBannerBatch([$collection->address], $network))->retryUntil())->toBeInstanceOf(DateTime::class);
});
