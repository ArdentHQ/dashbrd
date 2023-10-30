<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchPriceHistory;
use App\Jobs\UpdateTokenDetails;
use Carbon\Carbon;
use Closure;

trait DependsOnCoingeckoRateLimit
{
    /**
     * @var array<string>
     */
    private array $jobsThatUseCoingecko = [
        FetchPriceHistory::class,
        UpdateTokenDetails::class,
    ];

    /**
     * Used to delay jobs by a certain amount of seconds to prevent overlapping
     *
     * @var array<string, int>
     */
    private array $jobsDelayThreshold = [
        FetchPriceHistory::class => 0,
        UpdateTokenDetails::class => 1,
    ];

    private function getDispatchAt(string $job, int $index): Carbon
    {
        $maxRequests = config('services.coingecko.rate.max_requests');

        $perSeconds = config('services.coingecko.rate.per_seconds');

        $delayInSeconds = (int) floor($index / $maxRequests) * $perSeconds * $this->getRateLimitFactor();

        return Carbon::now()
            // Round to the next minute so the delay is always calculated from
            // the beginning of the minute which prevents overlapping considering
            // jobs may be dispatched at different times
            // e.g. 12:00:34 -> 12:01:00, 12:00:59 -> 12:01:00
            ->addMinute()->startOfMinute()
            // Delay the job by the amount of seconds + the delay treshold
            // e.g. 12:01:00 + 1 -> 12:01:01, 12:01:00 + 2 -> 12:01:02
            ->addSeconds($delayInSeconds + $this->getDelayTreshold($job));
    }

    private function getDelayTreshold(string $job): int
    {
        return $this->jobsDelayThreshold[$job] ?? 0;
    }

    private function getLimitPerMinutes(int $minutes): int
    {
        $maxRequests = config('services.coingecko.rate.max_requests');

        $perSeconds = config('services.coingecko.rate.per_seconds');

        $requestsPerHour = $maxRequests * $minutes * 60 / $perSeconds;

        // limit to the requests per hour to leave some room for other tasks
        return (int) floor($requestsPerHour / $this->getRateLimitFactor());
    }

    /**
     * This value is used to ensure we only run as many jobs as we can with coingecko,
     * it depends of the number of jobs that use coingecko consider the rare but
     * possible case where jobs are running at the same time.
     */
    private function getRateLimitFactor(): int
    {
        if (! $this->usesCoingecko()) {
            return 0;
        }

        return count($this->jobsThatUseCoingecko);
    }

    private function usesCoingecko(): bool
    {
        return config('services.marketdata.provider') === 'coingecko';
    }

    private function dispatchDelayed(Closure $callback, int $index, string $job): void
    {
        if (! $this->usesCoingecko()) {
            $callback();

            return;
        }

        // Note: I cant use delay directly on the job because it throws
        // the "too many attempts" error after some time so im delaying
        // with a queued closure instead
        dispatch($callback)->delay($this->getDispatchAt($job, $index));
    }
}
