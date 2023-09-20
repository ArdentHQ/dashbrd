<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionOwners;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Mnemonic;
use Illuminate\Support\Facades\Http;

it('should fetch nft collection owners', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/collections/v1beta2/*/metadata?includeStats=1' => Http::response([
            'ownersCount' => '789',
        ], 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'owners' => null,
    ]);

    $this->assertDatabaseCount('collections', 1);

    expect($collection->owners)->toBeNull();

    (new FetchCollectionOwners($collection))->handle();

    $collection->refresh();

    expect($collection->owners)->toBe(789);
});

it('should handle null owner count', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/collections/v1beta2/*/metadata?includeStats=1' => Http::response([
            'ownersCount' => null,
        ], 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'owners' => null,
    ]);

    $this->assertDatabaseCount('collections', 1);

    expect($collection->owners)->toBeNull();

    (new FetchCollectionOwners($collection))->handle();

    $collection->refresh();

    expect($collection->owners)->toBeNull();
});

it('has a unique ID', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionOwners($collection))->uniqueId())->toBe(FetchCollectionOwners::class.':'.$collection->id);
});

it('has a retry limit', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionOwners($collection))->retryUntil())->toBeInstanceOf(DateTime::class);
});
