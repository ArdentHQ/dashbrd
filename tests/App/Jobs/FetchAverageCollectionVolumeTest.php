<?php

declare(strict_types=1);

use App\Enums\Period;
use App\Jobs\FetchAverageCollectionVolume;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Mnemonic;

it('should fetch total volume for the collection', function () {
    Mnemonic::shouldReceive('getAverageCollectionVolume')->andReturn(753);

    $network = Network::polygon();

    $collection = Collection::factory()->for($network)->create([
        'avg_volume_1d' => '1',
        'avg_volume_7d' => '2',
        'avg_volume_30d' => '3',
    ]);

    (new FetchAverageCollectionVolume($collection, Period::WEEK))->handle();

    $collection->refresh();

    expect($collection->avg_volume_1d)->toBe('1');
    expect($collection->avg_volume_7d)->toBe('753');
    expect($collection->avg_volume_30d)->toBe('3');
});

it('has a unique ID', function () {
    $collection = Collection::factory()->create();

    expect((new FetchAverageCollectionVolume($collection, Period::WEEK))->uniqueId())->toBeString();
});

it('has a retry limit', function () {
    $collection = Collection::factory()->create();

    expect((new FetchAverageCollectionVolume($collection, Period::WEEK))->retryUntil())->toBeInstanceOf(DateTime::class);
});
