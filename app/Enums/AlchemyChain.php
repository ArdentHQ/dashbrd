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
            Chains::ETH->value => self::EthereumMainnet,
            Chains::Goerli->value => self::EthereumTestnet,
            Chains::Polygon->value => self::PolygonMainnet,
            Chains::Mumbai->value => self::PolygonTestnet,
            default => throw new \InvalidArgumentException(sprintf('Chain ID %d is not supported', $chainId)),
        };

        return $chain;
    }
}
