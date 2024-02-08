<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionVolumeHistory;
use App\Models\Collection;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for all collections', function () {
    Bus::fake();

    Collection::factory()->count(3)->create();

    Bus::assertDispatchedTimes(FetchCollectionVolumeHistory::class, 0);

    $this->artisan('collections:fetch-volume-history');

    Bus::assertDispatchedTimes(FetchCollectionVolumeHistory::class, 3);
});

it('dispatches a job for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionVolumeHistory::class, 0);

    $this->artisan('collections:fetch-volume-history', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionVolumeHistory::class, 1);
});
