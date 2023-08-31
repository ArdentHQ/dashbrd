<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionTraits;
use App\Models\Collection;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for collections', function () {
    Bus::fake();

    Collection::factory(3)->create();

    Bus::assertDispatchedTimes(FetchCollectionTraits::class, 0);

    $this->artisan('nfts:fetch-collection-traits');

    Bus::assertDispatchedTimes(FetchCollectionTraits::class, 3);
});

it('dispatches a job for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionTraits::class, 0);

    $this->artisan('nfts:fetch-collection-traits', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionTraits::class, 1);
});
