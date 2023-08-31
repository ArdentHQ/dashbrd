<?php

declare(strict_types=1);

namespace App\Jobs\Middleware;

use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use Closure;
use Illuminate\Support\Arr;
use Throwable;

class RecoverProviderErrors
{
    /**
     * Process the queued job.
     *
     * @param  Closure(object): void  $next
     */
    public function handle(object $job, Closure $next): void
    {
        // @codeCoverageIgnoreStart
        try {
            $next($job);
        } catch (RateLimitException $e) {
            $job->release($e->retryAfter); // @phpstan-ignore-line

            return;
        } catch (ConnectionException $e) {
            // report($e);

            // @phpstan-ignore-next-line
            $job->release(
                $job->backoff()[$job->attempts() - 1] ?? Arr::last($job->backoff()) // @phpstan-ignore-line
            );

            return;
        } catch (Throwable $e) {
            $job->fail($e); // @phpstan-ignore-line

            $job->onFailure($e); // @phpstan-ignore-line
        }

        // @codeCoverageIgnoreEnd
    }
}
