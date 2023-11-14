<?php

declare(strict_types=1);

namespace App\Enums;

enum AlchemyChain: string
{
    case EthereumMainnet = 'eth-mainnet';
    case EthereumTestnet = 'eth-testnet';
    case PolygonMainnet = 'polygon-mainnet';
    case PolygonTestnet = 'polygon-mumbai';

    public static function fromChainId(int $chainId): self
    {
        $chain = match ($chainId) {
            Chain::ETH->value => self::EthereumMainnet,
            Chain::Goerli->value => self::EthereumTestnet,
            Chain::Polygon->value => self::PolygonMainnet,
            Chain::Mumbai->value => self::PolygonTestnet,
            default => throw new \InvalidArgumentException(sprintf('Chain ID %d is not supported', $chainId)),
        };

        return $chain;
    }
}
