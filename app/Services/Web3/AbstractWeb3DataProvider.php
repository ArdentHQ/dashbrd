<?php

declare(strict_types=1);

namespace App\Services\Web3;

use App\Contracts\Web3DataProvider;

abstract class AbstractWeb3DataProvider implements Web3DataProvider
{
    /**
     * Get the middleware to be used for jobs.
     *
     * @return array<int, object>
     */
    abstract public function getMiddleware(): array;
}
