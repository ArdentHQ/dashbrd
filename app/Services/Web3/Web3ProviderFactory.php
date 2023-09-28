<?php

declare(strict_types=1);

namespace App\Services\Web3;

use App\Contracts\Web3DataProvider;
use App\Services\Web3\Alchemy\AlchemyWeb3DataProvider;
use App\Services\Web3\Fake\FakeWeb3DataProvider;
use App\Services\Web3\Mnemonic\MnemonicWeb3DataProvider;
use App\Services\Web3\Moralis\MoralisWeb3DataProvider;
use InvalidArgumentException;

class Web3ProviderFactory
{
    public static function create(string $provider): Web3DataProvider
    {
        return match ($provider) {
            'alchemy' => app(AlchemyWeb3DataProvider::class),
            'moralis' => app(MoralisWeb3DataProvider::class),
            'mnemonic' => app(MnemonicWeb3DataProvider::class),
            'fake' => app(FakeWeb3DataProvider::class),
            default => throw new InvalidArgumentException('No web3 data provider named ['.$provider.'].'),
        };
    }
}
