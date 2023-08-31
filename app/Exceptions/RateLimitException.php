<?php

declare(strict_types=1);

namespace App\Exceptions;

use Exception;

class RateLimitException extends Exception
{
    public function __construct(
        public int $retryAfter
    ) {
        parent::__construct();
    }
}
