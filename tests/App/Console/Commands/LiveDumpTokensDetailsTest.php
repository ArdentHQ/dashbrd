<?php

declare(strict_types=1);

use App\Jobs\FetchTopTokens;
use Illuminate\Support\Facades\Bus;

it('dispatches the job with default count (1000)', function () {
    Bus::fake();

    Bus::assertDispatchedTimes(FetchTopTokens::class, 0);

    $this->artisan('tokens:live-dump');

    Bus::assertDispatchedTimes(FetchTopTokens::class, 4);
});

it('dispatches a job with different count', function ($count, $jobsCount, $lastItemsCount) {
    Bus::fake();

    Bus::assertDispatchedTimes(FetchTopTokens::class, 0);

    $this->artisan('tokens:live-dump', [
        '--count' => $count,
    ]);

    Bus::assertDispatchedTimes(FetchTopTokens::class, $jobsCount);

    Bus::assertDispatched(FetchTopTokens::class, fn (FetchTopTokens $job) => $job->page === $jobsCount && $job->count === $lastItemsCount);
})->with([
    [100, 1, 100],
    [1250, 5, 250],
    [1249, 5, 249],
]);
