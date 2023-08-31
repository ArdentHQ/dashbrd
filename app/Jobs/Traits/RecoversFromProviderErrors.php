<?php

declare(strict_types=1);

namespace App\Jobs\Traits;

use App\Jobs\Middleware\RecoverProviderErrors;
use DateTime;
use Throwable;

trait RecoversFromProviderErrors
{
    /**
     * Get the middleware the job should pass through.
     *
     * @return object[]
     */
    public function middleware(): array
    {
        return [
            new RecoverProviderErrors,
        ];
    }

    /**
     * @return int[]
     */
    public function backoff(): array
    {
        return [5, 15, 30, 60];
    }

    /**
     * Do any additional cleanup after job definitely fails.
     */
    public function onFailure(Throwable $exception): void
    {
        //
    }

    /**
     * Determine the time at which the job should timeout.
     */
    public function retryUntil(): DateTime
    {
        return now()->addMinutes(1); // @codeCoverageIgnore
    }
}
