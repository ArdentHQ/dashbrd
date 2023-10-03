<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionActivity;
use App\Models\Collection;
use Illuminate\Support\Facades\Bus;

it('dispatches a job only for collections that are not currently already retrieving their activity', function () {
    Bus::fake();

    Collection::factory()->create([
        'is_fetching_activity' => true,
    ]);

    Collection::factory()->create([
        'is_fetching_activity' => false,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionActivity::class, 0);

    $this->artisan('collections:fetch-activity');

    Bus::assertDispatchedTimes(FetchCollectionActivity::class, 1);
});

it('dispatches a job for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionActivity::class, 0);

    $this->artisan('collections:fetch-activity', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionActivity::class, 1);
});
