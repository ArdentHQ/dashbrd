<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionVolumeForPeriod;
use App\Models\Collection;
use Illuminate\Support\Facades\Bus;

it('dispatches job for all supported periods for all collections', function () {
    Bus::fake();

    Collection::factory()->count(3)->create();

    Bus::assertDispatchedTimes(FetchCollectionVolumeForPeriod::class, 0);

    $this->artisan('collections:fetch-periodic-volume');

    Bus::assertDispatchedTimes(FetchCollectionVolumeForPeriod::class, 9);
});

it('dispatches job for all supported periods for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionVolumeForPeriod::class, 0);

    $this->artisan('collections:fetch-periodic-volume', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionVolumeForPeriod::class, 3);
});

it('dispatches job for specific period for all collections', function () {
    Bus::fake();

    Collection::factory()->count(3)->create();

    Bus::assertDispatchedTimes(FetchCollectionVolumeForPeriod::class, 0);

    $this->artisan('collections:fetch-periodic-volume', [
        '--period' => '7d',
    ]);

    Bus::assertDispatchedTimes(FetchCollectionVolumeForPeriod::class, 3);
});

it('dispatches job for specific period for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionVolumeForPeriod::class, 0);

    $this->artisan('collections:fetch-periodic-volume', [
        '--collection-id' => $collection->id,
        '--period' => '7d',
    ]);

    Bus::assertDispatchedTimes(FetchCollectionVolumeForPeriod::class, 1);
});

it('handles unsupported period values', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionVolumeForPeriod::class, 0);

    $this->artisan('collections:fetch-periodic-volume', [
        '--collection-id' => $collection->id,
        '--period' => '1m',
    ]);

    Bus::assertDispatchedTimes(FetchCollectionVolumeForPeriod::class, 0);
});
