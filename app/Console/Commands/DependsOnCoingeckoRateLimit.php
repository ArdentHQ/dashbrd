<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchPriceHistory;
use App\Jobs\UpdateTokenDetails;
use App\Jobs\VerifySupportedCurrencies;
use Carbon\Carbon;
use Closure;

trait DependsOnCoingeckoRateLimit
{
    /**
     * Used to delay jobs by a certain amount of seconds to prevent overlapping
     *
     * @var array<string, int>
     */
    private array $jobsDelayThreshold = [
        UpdateTokenDetails::class => 0,
        // Notice that im skiping the index `1` because that is the threshold
        // for the second call of the `UpdateTokenDetails` job (passed as an argument)
        FetchPriceHistory::class => 2,
        VerifySupportedCurrencies::class => 3,
    ];

    private function getDispatchAt(string $job, int $index, ?int $delayThreshold): Carbon
    {
        $maxRequests = config('services.coingecko.rate.max_requests');

        $perSeconds = config('services.coingecko.rate.per_seconds');

        $delayInSeconds = (int) floor($index / $maxRequests) * $perSeconds * $this->getRateLimitFactor();

        $delayThreshold = $delayThreshold !== null ? $delayThreshold : $this->getDelayTreshold($job);

        return Carbon::now()
            // Round to the next minute so the delay is always calculated from
            // the beginning of the minute which prevents overlapping considering
            // jobs may be dispatched at different times
            // e.g. 12:00:34 -> 12:01:00, 12:00:59 -> 12:01:00
            ->addMinute()->startOfMinute()
            // Delay the job by the amount of seconds + the delay treshold
            // e.g. 12:01:00 + 1 -> 12:01:01, 12:01:00 + 2 -> 12:01:02
            ->addSeconds($delayInSeconds + $delayThreshold);
    }

    private function getDelayTreshold(string $job): int
    {
        return $this->jobsDelayThreshold[$job] ?? 0;
    }

    public function getLimitPerMinutes(int $minutes): int
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
        return
            ($this->runsVerifySupportedCurrencies() ? 1 : 0)
            + ($this->runsUpdateTokenDetailsForRestOfTokens() ? 2 : 1)
            + ($this->runsFetchPriceHistory() ? 1 : 0);

    }

    private function runsVerifySupportedCurrencies(): bool
    {
        $isMonday = date('N') === '1';

        return $isMonday;
    }

    /**
     * After 19hrs it runs the `UpdateTokenDetails` + the job for the rest of
     * the tokens (see `app/Console/Kernel.php` file).
     *
     * *Subtracting 15 minutes to leave room for the `UpdateTokenDetails` that
     * runs every 15 minutes
     */
    private function runsUpdateTokenDetailsForRestOfTokens(): bool
    {
        $isAfter1845 = Carbon::now()->gt(Carbon::today()->setTime(18, 45));

        return $isAfter1845;
    }

    /**
     * After 13hrs it runs the `FetchPriceHistory` job
     *
     * *Subtracting 15 minutes to leave room for the `UpdateTokenDetails` that
     * runs every 15 minutes
     */
    private function runsFetchPriceHistory(): bool
    {
        $isAfter1245 = Carbon::now()->gt(Carbon::today()->setTime(12, 45));

        return $isAfter1245;
    }

    private function dispatchDelayed(Closure $callback, int $index, string $job, int $delayThreshold = null): void
    {
        // Note: I cant use delay directly on the job because it throws
        // the "too many attempts" error after some time so im delaying
        // with a queued closure instead
        dispatch($callback)->delay($this->getDispatchAt($job, $index, $delayThreshold));
    }
}
