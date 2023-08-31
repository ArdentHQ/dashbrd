<?php

declare(strict_types=1);

namespace App\Http\Client\MarketData;

use Illuminate\Http\Client\Factory;

class CoingeckoFactory extends Factory
{
    protected function newPendingRequest(): CoingeckoPendingRequest
    {
        return new CoingeckoPendingRequest($this);
    }
}
