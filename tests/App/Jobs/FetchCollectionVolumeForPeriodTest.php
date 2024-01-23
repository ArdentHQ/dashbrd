<?php

declare(strict_types=1);

use App\Enums\Period;
use App\Jobs\FetchCollectionVolumeForPeriod;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Mnemonic;

it('should fetch total volume for the collection', function () {
    Mnemonic::shouldReceive('getCollectionVolumeForPeriod')->andReturn(753);

    $network = Network::polygon();

    $collection = Collection::factory()->for($network)->create([
        'volume_1d' => '1',
        'volume_7d' => '2',
        'volume_30d' => '3',
    ]);

    (new FetchCollectionVolumeForPeriod($collection, Period::WEEK))->handle();

    $collection->refresh();

    expect($collection->volume_1d)->toBe('1');
    expect($collection->volume_7d)->toBe('753');
    expect($collection->volume_30d)->toBe('3');
});

it('has a unique ID', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionVolumeForPeriod($collection, Period::WEEK))->uniqueId())->toBeString();
});

it('has a retry limit', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionVolumeForPeriod($collection, Period::WEEK))->retryUntil())->toBeInstanceOf(DateTime::class);
});
