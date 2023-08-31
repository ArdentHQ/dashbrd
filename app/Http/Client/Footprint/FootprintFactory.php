<?php

declare(strict_types=1);

namespace App\Http\Client\Footprint;

use Illuminate\Http\Client\Factory;

class FootprintFactory extends Factory
{
    protected function newPendingRequest(): FootprintPendingRequest
    {
        return new FootprintPendingRequest($this);
    }
}
