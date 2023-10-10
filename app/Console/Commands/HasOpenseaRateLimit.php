<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionFloorPrice;
use App\Jobs\FetchCollectionOpenseaSlug;
use Illuminate\Support\Facades\Config;

trait HasOpenseaRateLimit
{
    /**
     * @var array<string>
     */
    private array $jobsThatMayUseOpensea = [
        FetchCollectionFloorPrice::class,
    ];

    /**
     * @var array<string>
     */
    private array $jobsThatUseOpensea = [
        FetchCollectionOpenseaSlug::class,
    ];

    /**
     * Used to delay jobs by a certain amount of seconds to prevent overlapping
     *
     * @var array<string, int>
     */
    private array $jobsDelayThreshold = [
        FetchCollectionFloorPrice::class => 0,
        FetchCollectionOpenseaSlug::class => 1,
    ];

    private function getDelayInSeconds(string $job, int $index): int
    {
        $maxRequests = config('services.opensea.rate.max_requests');

        $perSeconds = config('services.opensea.rate.per_seconds');

        $delayInSeconds = (int) floor($index / $maxRequests) * $perSeconds * $this->getRateLimitFactor();

        return $delayInSeconds + $this->getDelayTreshold($job);
    }

    private function getDelayTreshold(string $job): int
    {
        return $this->jobsDelayThreshold[$job] ?? 0;
    }

    private function getLimit(): int
    {
        $maxRequests = config('services.opensea.rate.max_requests');

        $perSeconds = config('services.opensea.rate.per_seconds');

        $requestsPerHour = $maxRequests * 60 * 60 / $perSeconds;

        // limit to the requests per hour to leave some room for other tasks
        return (int) floor($requestsPerHour / $this->getRateLimitFactor());
    }

    /**
     * This value is used to ensure we only run as many jobs as we can with opensea,
     * it depends of the number of jobs that use opensea consider the rare but
     * possible case where jobs are running at the same time.
     */
    private function getRateLimitFactor(): int
    {
        $totalJobsThatUseOpensea
            = collect($this->jobsThatMayUseOpensea)->filter(fn ($job) => $this->usesOpensea($job))->count()
            + count($this->jobsThatUseOpensea);

        return $totalJobsThatUseOpensea;
    }

    private function usesOpensea(string $job): bool
    {
        return Config::get('dashbrd.web3_providers.'.$job) === 'opensea';
    }
}
