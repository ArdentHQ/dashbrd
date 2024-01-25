<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionOwners;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Mnemonic;
use Illuminate\Support\Facades\Http;

it('should fetch nft collection owners', function () {
    Mnemonic::shouldReceive('getCollectionOwners')->andReturn(789);

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
    Mnemonic::shouldReceive('getCollectionOwners')->andReturn(0);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'owners' => null,
    ]);

    $this->assertDatabaseCount('collections', 1);

    expect($collection->owners)->toBeNull();

    (new FetchCollectionOwners($collection))->handle();

    $collection->refresh();

    expect($collection->owners)->toBe(0);
});

it('has a unique ID', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionOwners($collection))->uniqueId())->toBe(FetchCollectionOwners::class.':'.$collection->id);
});

it('has a retry limit', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionOwners($collection))->retryUntil())->toBeInstanceOf(DateTime::class);
});
