<?php

declare(strict_types=1);

namespace App\Http\Client\Mnemonic;

use App\Enums\MnemonicChain;
use Illuminate\Http\Client\Factory;

class MnemonicFactory extends Factory
{
    private ?MnemonicChain $chain = null;

    protected function newPendingRequest(): MnemonicPendingRequest
    {
        return new MnemonicPendingRequest($this, $this->chain);
    }

    public function withChain(MnemonicChain $chain): self
    {
        $this->chain = $chain;

        return $this;
    }
}
