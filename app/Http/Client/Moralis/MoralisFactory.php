<?php

declare(strict_types=1);

namespace App\Http\Client\Moralis;

use Illuminate\Http\Client\Factory;

class MoralisFactory extends Factory
{
    protected function newPendingRequest(): MoralisPendingRequest
    {
        return new MoralisPendingRequest($this);
    }
}
