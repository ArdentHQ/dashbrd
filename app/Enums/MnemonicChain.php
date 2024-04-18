<?php

declare(strict_types=1);

namespace App\Enums;

use InvalidArgumentException;

enum MnemonicChain: string
{
    case Ethereum = 'ethereum';
    case Polygon = 'polygon';

    public static function fromChain(Chain $chain): self
    {
        return match ($chain) {
            Chain::ETH => self::Ethereum,
            Chain::Polygon => throw new InvalidArgumentException('Mnemonic does not support Polygon networks.'),
            default => throw new InvalidArgumentException(sprintf('Chain ID %d is not supported', $chain->name)),
        };
    }
}
