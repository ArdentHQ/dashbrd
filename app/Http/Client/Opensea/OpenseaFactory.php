<?php

declare(strict_types=1);

namespace App\Http\Client\Opensea;

use Illuminate\Http\Client\Factory;

class OpenseaFactory extends Factory
{
    protected function newPendingRequest(): OpenseaPendingRequest
    {
        return new OpenseaPendingRequest($this);
    }
}
