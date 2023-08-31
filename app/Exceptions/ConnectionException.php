<?php

declare(strict_types=1);

namespace App\Exceptions;

use Exception;

class ConnectionException extends Exception
{
    public function __construct(
        public string $service,
        public string $url,
        public int $statusCode,
    ) {
        parent::__construct(
            sprintf('%s appears to be down and has responded with %s status code to URL: [%s].', $this->service, $this->statusCode, $this->url),
            $this->statusCode
        );
    }
}
