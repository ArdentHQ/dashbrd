<?php

declare(strict_types=1);

use App\Jobs\FetchBurnActivity;
use App\Models\Collection;
use Illuminate\Support\Facades\Bus;

beforeEach(function () {
    config([
        'dashbrd.features.activities' => true,
    ]);
});

it('dispatches a job only for collections that have previously indexed activities', function () {
    Bus::fake();

    Collection::factory()->create([
        'activity_updated_at' => now(),
    ]);

    Collection::factory()->create([
        'activity_updated_at' => null,
    ]);

    Bus::assertDispatchedTimes(FetchBurnActivity::class, 0);

    $this->artisan('collections:fetch-burn-activity');

    Bus::assertDispatchedTimes(FetchBurnActivity::class, 1);
});

it('dispatches a job for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchBurnActivity::class, 0);

    $this->artisan('collections:fetch-burn-activity', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchBurnActivity::class, 1);
});

it('does not run if activities are disabled', function () {
    Bus::fake();

    config([
        'dashbrd.features.activities' => false,
    ]);

    Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchBurnActivity::class, 0);

    $this->artisan('collections:fetch-burn-activity');

    Bus::assertDispatchedTimes(FetchBurnActivity::class, 0);
});
