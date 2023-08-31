<?php

declare(strict_types=1);

namespace App\Http\Client\Alchemy;

use Illuminate\Http\Client\Factory;

class AlchemyFactory extends Factory
{
    protected function newPendingRequest(): AlchemyPendingRequest
    {
        return new AlchemyPendingRequest($this);
    }
}
