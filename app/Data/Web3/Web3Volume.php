<?php

declare(strict_types=1);

namespace App\Data\Web3;

use Carbon\Carbon;

readonly class Web3Volume
{
    public function __construct(
        public string $value,
        public Carbon $date
    ) {
    }
}
