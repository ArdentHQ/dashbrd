<?php

declare(strict_types=1);

namespace App\Http\Client\Mnemonic;

use Illuminate\Http\Client\Factory;

class MnemonicFactory extends Factory
{
    protected function newPendingRequest(): MnemonicPendingRequest
    {
        return new MnemonicPendingRequest($this);
    }
}
