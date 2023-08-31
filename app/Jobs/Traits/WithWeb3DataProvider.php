<?php

declare(strict_types=1);

namespace App\Jobs\Traits;

use App\Contracts\Web3DataProvider;
use App\Services\Web3\Web3ProviderFactory;

trait WithWeb3DataProvider
{
    private ?Web3DataProvider $provider = null;

    public function getWeb3DataProvider(): Web3DataProvider
    {
        $this->provider ??= $this->createWeb3DataProvider();

        return $this->provider;
    }

    private function createWeb3DataProvider(): Web3DataProvider
    {
        $default = config('dashbrd.web3_providers.default');

        return Web3ProviderFactory::create(
            config('dashbrd.web3_providers.'.self::class) ?? $default
        );
    }
}
