<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionFloorPrice;
use App\Models\Collection;
use App\Models\SpamContract;
use Carbon\Carbon;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Config;

it('dispatches a job for collections', function () {
    Bus::fake();

    Collection::factory(3)->create();

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 0);

    $this->artisan('nfts:fetch-collection-floor-price');

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 3);
});

it('delays the jobs according to the opensea limits', function () {
    Carbon::setTestNow('2023-01-01 00:00:00');

    Bus::fake();

    $collections = Collection::factory(10)->create();

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 0);

    $this->artisan('nfts:fetch-collection-floor-price');

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 10);

    foreach ($collections as $index => $collection) {
        Bus::assertDispatched(FetchCollectionFloorPrice::class, function ($job) use ($collection, $index) {
            // @see app/Console/Commands/HasOpenseaRateLimit.php@getRateLimitFactor
            $totalOpenseaJobs = 2;

            $maxRequests = config('services.opensea.rate.max_requests');

            $expectedDelay = floor($index / $maxRequests) * 1 * $totalOpenseaJobs;

            $delay = Carbon::now()->addSeconds($expectedDelay);

            return $job->chainId === $collection->network->chain_id
                && $job->address === $collection->address
                && $job->delay->equalTo($delay);
        });
    }
});

it('dispatches a job for collections if provider is not opensea', function () {
    Config::set('dashbrd.web3_providers.'.FetchCollectionFloorPrice::class, 'mnemonic');

    Bus::fake();

    Collection::factory(3)->create();

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 0);

    $this->artisan('nfts:fetch-collection-floor-price');

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 3);

    Bus::assertDispatched(FetchCollectionFloorPrice::class, function ($job) {
        return $job->delay === null;
    });
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
