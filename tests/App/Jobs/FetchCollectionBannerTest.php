<?php

declare(strict_types=1);

use App\Enums\Chain;
use App\Jobs\FetchCollectionBanner;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Mnemonic;

it('does not run for polygon network', function () {
    Mnemonic::shouldReceive('getCollectionBanner')->never();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'floor_price' => null,
        'floor_price_token_id' => null,
        'floor_price_retrieved_at' => null,
        'extra_attributes' => [
            'image' => 'image-url',
        ],
    ]);

    expect($collection->banner())->toBeNull();

    (new FetchCollectionBanner($collection))->handle();
});

it('should fetch nft collection banner', function () {
    Mnemonic::shouldReceive('getCollectionBanner')->andReturn('https://i.seadn.io/gcs/files/f0d3006fb5a1f09d1619a024762f5aee.png?w=1378&auto=format');

    $network = Network::firstWhere('chain_id', Chain::ETH);

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'floor_price' => null,
        'floor_price_token_id' => null,
        'floor_price_retrieved_at' => null,
        'extra_attributes' => [
            'image' => 'image-url',
        ],
    ]);

    expect($collection->banner())->toBeNull();

    (new FetchCollectionBanner($collection))->handle();

    $collection->refresh();

    expect($collection->banner())->toBe('https://i.seadn.io/gcs/files/f0d3006fb5a1f09d1619a024762f5aee.png?w=1378&auto=format');
    expect($collection->image())->toBe('image-url');
});

it('should fetch nft collection banner in case no image', function () {
    Mnemonic::shouldReceive('getCollectionBanner')->andReturn(null);

    $network = Network::firstWhere('chain_id', Chain::ETH);

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'floor_price' => null,
        'floor_price_token_id' => null,
        'floor_price_retrieved_at' => null,
    ]);

    expect($collection->banner())->toBeNull();

    (new FetchCollectionBanner($collection))->handle();

    $collection->refresh();

    expect($collection->banner())->toBeNull();
});

it('should use the collection address and network id as a unique job identifier', function () {
    $network = Network::firstWhere('chain_id', Chain::ETH);

    $collection = Collection::factory()->create([
        'address' => '0x12345',
        'network_id' => $network->id,
    ]);

    expect((new FetchCollectionBanner($collection))->uniqueId())->toBe(FetchCollectionBanner::class.':'.$collection->network->chain_id.'-'.$collection->address);
});

it('has a retry limit', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionBanner($collection))->retryUntil())->toBeInstanceOf(DateTime::class);
});
