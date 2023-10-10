<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionOpenseaSlug;
use App\Models\Collection;
use Carbon\Carbon;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for collections without opensea slug or fetched date', function () {
    Bus::fake();

    Collection::factory()->create();

    Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug' => 'testy',
            'opensea_slug_last_fetched_at' => now()->subDay(),
        ],
    ]);
    Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug' => 'testy',
        ],
    ]);

    Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug_last_fetched_at' => now()->subDay(),
        ],
    ]);

    Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionOpenseaSlug::class, 0);

    $this->artisan('nfts:fetch-collection-opensea-slug');

    Bus::assertDispatchedTimes(FetchCollectionOpenseaSlug::class, 2);
});

it('delays the jobs according to the opensea limits', function () {
    Carbon::setTestNow('2023-01-01 00:00:00');

    Bus::fake();

    $collections = Collection::factory(10)->create();

    Bus::assertDispatchedTimes(FetchCollectionOpenseaSlug::class, 0);

    $this->artisan('nfts:fetch-collection-opensea-slug');

    Bus::assertDispatchedTimes(FetchCollectionOpenseaSlug::class, 10);

    foreach ($collections as $index => $collection) {
        Bus::assertDispatched(FetchCollectionOpenseaSlug::class, function ($job) use ($collection, $index) {
            // @see app/Console/Commands/HasOpenseaRateLimit.php@getRateLimitFactor
            $totalOpenseaJobs = 2;
            $threshold = 1;

            $maxRequests = config('services.opensea.rate.max_requests');

            $expectedDelay = (floor($index / $maxRequests) * 1 * $totalOpenseaJobs) + $threshold;

            $delay = Carbon::now()->addSeconds($expectedDelay);

            return $job->collection->is($collection) && $job->delay->equalTo($delay);
        });
    }
});

it('dispatches a job for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionOpenseaSlug::class, 0);

    $this->artisan('nfts:fetch-collection-opensea-slug', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionOpenseaSlug::class, 1);
});
