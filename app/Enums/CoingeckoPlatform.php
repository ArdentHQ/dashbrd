<?php

declare(strict_types=1);

namespace App\Enums;

enum CoingeckoPlatform: string
{
    case Ethereum = 'ethereum';
    case Polygon = 'polygon-pos';

    public function toChain(): Chains
    {
        return match ($this) {
            CoingeckoPlatform::Ethereum => Chains::ETH,
            CoingeckoPlatform::Polygon => Chains::Polygon,
        };
    }

    public static function tryFromChainId(int $chainId): ?CoingeckoPlatform
    {
        return match ($chainId) {
            Chains::ETH->value => CoingeckoPlatform::Ethereum,
            Chains::Polygon->value => CoingeckoPlatform::Polygon,
            default => null,
        };
    }
}
