<?php

declare(strict_types=1);

use App\Jobs\FetchAverageCollectionVolume;
use App\Models\Collection;
use Illuminate\Support\Facades\Bus;

it('dispatches job for all supported periods for all collections', function () {
    Bus::fake();

    Collection::factory()->count(3)->create();

    Bus::assertDispatchedTimes(FetchAverageCollectionVolume::class, 0);

    $this->artisan('collections:fetch-average-volumes');

    Bus::assertDispatchedTimes(FetchAverageCollectionVolume::class, 9);
});

it('dispatches job for all supported periods for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchAverageCollectionVolume::class, 0);

    $this->artisan('collections:fetch-average-volumes', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchAverageCollectionVolume::class, 3);
});

it('dispatches job for specific period for all collections', function () {
    Bus::fake();

    Collection::factory()->count(3)->create();

    Bus::assertDispatchedTimes(FetchAverageCollectionVolume::class, 0);

    $this->artisan('collections:fetch-average-volumes', [
        '--period' => '7d',
    ]);

    Bus::assertDispatchedTimes(FetchAverageCollectionVolume::class, 3);
});

it('dispatches job for specific period for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchAverageCollectionVolume::class, 0);

    $this->artisan('collections:fetch-average-volumes', [
        '--collection-id' => $collection->id,
        '--period' => '7d',
    ]);

    Bus::assertDispatchedTimes(FetchAverageCollectionVolume::class, 1);
});

it('handles unsupported period values', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchAverageCollectionVolume::class, 0);

    $this->artisan('collections:fetch-average-volumes', [
        '--collection-id' => $collection->id,
        '--period' => '1m',
    ]);

    Bus::assertDispatchedTimes(FetchAverageCollectionVolume::class, 0);
});
