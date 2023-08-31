<?php

declare(strict_types=1);

namespace App\Enums;

enum FootprintChain: string
{
    // @see https://docs.footprint.network/reference/supported-chains
    case EthereumMainnet = 'Ethereum';
    case PolygonMainnet = 'Polygon';

    public static function fromChainId(int $chainId): self
    {
        $chain = match ($chainId) {
            Chains::ETH->value => self::EthereumMainnet,
            Chains::Polygon->value => self::PolygonMainnet,
            default => throw new \InvalidArgumentException(sprintf('Chain ID %d is not supported', $chainId)),
        };

        return $chain;
    }
}
