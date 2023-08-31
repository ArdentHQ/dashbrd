<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionVolume;
use App\Models\Collection;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for all collections', function () {
    Bus::fake();

    Collection::factory()->count(3)->create();

    Bus::assertDispatchedTimes(FetchCollectionVolume::class, 0);

    $this->artisan('nfts:fetch-collection-volume');

    Bus::assertDispatchedTimes(FetchCollectionVolume::class, 3);
});

it('dispatches a job for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionVolume::class, 0);

    $this->artisan('nfts:fetch-collection-volume', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionVolume::class, 1);
});
