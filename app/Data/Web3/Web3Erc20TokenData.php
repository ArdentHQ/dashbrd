<?php

declare(strict_types=1);

namespace App\Data\Web3;

readonly class Web3Erc20TokenData
{
    public function __construct(
        public string $tokenAddress,
        public int $networkId,
        public ?string $ownedByAddress,
        public ?string $name,
        public ?string $symbol,
        public ?int $decimals,
        public ?string $logo,
        public ?string $thumbnail,
        public ?string $balance,
    ) {
    }
}
