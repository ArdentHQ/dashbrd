<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionTotalVolume;
use App\Models\Collection;
use App\Models\SpamContract;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for collections', function () {
    Bus::fake([FetchCollectionTotalVolume::class]);

    Collection::factory(3)->create([
        'extra_attributes' => [
            'opensea_slug' => 'some-slug',
        ],
    ]);

    Bus::assertDispatchedTimes(FetchCollectionTotalVolume::class, 0);

    $this->artisan('collections:fetch-total-volume');

    Bus::assertDispatchedTimes(FetchCollectionTotalVolume::class, 3);
});

it('should not dispatch a job for a spam collection', function () {
    Bus::fake([FetchCollectionTotalVolume::class]);

    $collections = Collection::factory(3)->create([
        'extra_attributes' => [
            'opensea_slug' => 'some-slug',
        ],
    ]);

    SpamContract::query()->insert([
        'address' => $collections->first()->address,
        'network_id' => $collections->first()->network_id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionTotalVolume::class, 0);

    $this->artisan('collections:fetch-total-volume');

    Bus::assertDispatchedTimes(FetchCollectionTotalVolume::class, 2);
});

it('dispatches a job for a specific collection', function () {
    Bus::fake([FetchCollectionTotalVolume::class]);

    $collection = Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug' => 'some-slug',
        ],
    ]);

    Bus::assertDispatchedTimes(FetchCollectionTotalVolume::class, 0);

    $this->artisan('collections:fetch-total-volume', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionTotalVolume::class, 1);
});

it('should not dispatch a job for a given spam collection', function () {
    Bus::fake([FetchCollectionTotalVolume::class]);

    $collection = Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug' => 'some-slug',
        ],
    ]);

    SpamContract::query()->insert([
        'address' => $collection->address,
        'network_id' => $collection->network_id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionTotalVolume::class, 0);

    $this->artisan('collections:fetch-total-volume', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionTotalVolume::class, 0);
});
