<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionOwners;
use App\Models\Collection;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for all collections', function () {
    Bus::fake();

    Collection::factory()->count(3)->create();

    Bus::assertDispatchedTimes(FetchCollectionOwners::class, 0);

    $this->artisan('nfts:fetch-collection-owners');

    Bus::assertDispatchedTimes(FetchCollectionOwners::class, 3);
});

it('dispatches a job for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionOwners::class, 0);

    $this->artisan('nfts:fetch-collection-owners', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionOwners::class, 1);
});
