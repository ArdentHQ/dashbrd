<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionFloorPrice;
use App\Models\Collection;
use App\Models\SpamContract;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for collections', function () {
    Bus::fake();

    Collection::factory(3)->create();

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 0);

    $this->artisan('nfts:fetch-collection-floor-price');

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 3);
});

it('should not dispatch a job for a spam collection', function () {
    Bus::fake();

    $collections = Collection::factory(3)->create();

    SpamContract::query()->insert([
        'address' => $collections->first()->address,
        'network_id' => $collections->first()->network_id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 0);

    $this->artisan('nfts:fetch-collection-floor-price');

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 2);
});

it('dispatches a job for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 0);

    $this->artisan('nfts:fetch-collection-floor-price', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 1);
});

it('should not dispatch a job for a given spam collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    SpamContract::query()->insert([
        'address' => $collection->address,
        'network_id' => $collection->network_id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 0);

    $this->artisan('nfts:fetch-collection-floor-price', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 0);
});
