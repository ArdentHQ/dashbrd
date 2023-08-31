<?php

declare(strict_types=1);

namespace App\Jobs\Middleware;

use App\Enums\Service;
use Closure;
use Exception;
use Illuminate\Contracts\Queue\Job;
use Illuminate\Support\Facades\Redis;

/**
 * Note: there is laravel built-in RateLimited middleware (Illuminate\Queue\Middleware\RateLimited)
 * but is is not suitable for our needs because it seems to release the job after
 * the interval passed relative to the first job call in the timefrime, not the last
 * job.
 */
class RateLimited
{
    public function __construct(private Service $service)
    {
        //
    }

    /**
     * Process the queued job.
     *
     * @param  Job  $job
     * @param  \Closure(object): void  $next
     */
    public function handle(object $job, Closure $next): void
    {
        $maxRequests = $this->getMaxRequests();

        $perSeconds = $this->getPerSeconds();

        Redis::throttle('api-service.'.$this->service->value)
            ->block(0)->allow($maxRequests)->every($perSeconds)
            ->then(static function () use ($job, $next) {
                $next($job);
            }, static function () use ($job, $perSeconds) {
                $job->release($perSeconds + 5);
            });
    }

    private function getMaxRequests(): int
    {
        return $this->getRateLimit('max_requests');
    }

    private function getPerSeconds(): int
    {
        return $this->getRateLimit('per_seconds');
    }

    private function getRateLimit(string $key): int
    {
        $rateLimit = config('services.'.$this->service->value.'.rate.'.$key);
        if ($rateLimit === null) {
            throw new Exception('Missing rate limits for ['.$this->service->value.'].');
        }

        return (int) $rateLimit;
    }
}
