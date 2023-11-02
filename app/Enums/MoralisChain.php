<?php

declare(strict_types=1);

namespace App\Enums;

enum MoralisChain: string
{
    case ETH = 'eth';
    case Goerli = 'goerli';
    case Polygon = 'polygon';
    case Mumbai = 'mumbai';

    public static function fromChainId(int $chainId): self
    {
        return match ($chainId) {
            Chain::ETH->value => self::ETH,
            Chain::Goerli->value => self::Goerli,
            Chain::Polygon->value => self::Polygon,
            Chain::Mumbai->value => self::Mumbai,
            default => throw new \InvalidArgumentException(sprintf('Chain ID %d is not supported', $chainId)),
        };
    }
}
