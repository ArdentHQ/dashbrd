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
            Chains::ETH->value => self::ETH,
            Chains::Goerli->value => self::Goerli,
            Chains::Polygon->value => self::Polygon,
            Chains::Mumbai->value => self::Mumbai,
            default => throw new \InvalidArgumentException(sprintf('Chain ID %d is not supported', $chainId)),
        };
    }
}
