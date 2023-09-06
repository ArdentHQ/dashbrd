<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionTraits;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Mnemonic;
use Illuminate\Support\Facades\Http;

it('should fetch nft collection traits', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/collections/v1beta2/*/traits/string?*' => Http::response(fixtureData('mnemonic.collection_traits_string'), 200),
        'https://polygon-rest.api.mnemonichq.com/collections/v1beta2/*/traits/numeric?*' => Http::response(fixtureData('mnemonic.collection_traits_numeric'), 200),
    ]);

    $network = Network::polygon()->firstOrFail();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    expect($collection->banner())->toBeNull();

    (new FetchCollectionTraits($collection))->handle();

    $collection->refresh();

    expect($collection->traits)->toHaveCount(25);
});

it('should use the collection address and network id as a unique job identifier', function () {
    $network = Network::polygon()->firstOrFail();

    $collection = Collection::factory()->create([
        'address' => '0x12345',
        'network_id' => $network->id,
    ]);

    expect((new FetchCollectionTraits($collection))->uniqueId())->toBe(FetchCollectionTraits::class.':'.$collection->network->chain_id.'-'.$collection->address);
});

it('has a retry limit', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionTraits($collection))->retryUntil())->toBeInstanceOf(DateTime::class);
});
