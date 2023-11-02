<?php

declare(strict_types=1);

namespace App\Enums;

enum CoingeckoPlatform: string
{
    case Ethereum = 'ethereum';
    case Polygon = 'polygon-pos';

    public function toChain(): Chain
    {
        return match ($this) {
            CoingeckoPlatform::Ethereum => Chain::ETH,
            CoingeckoPlatform::Polygon => Chain::Polygon,
        };
    }

    public static function tryFromChainId(int $chainId): ?CoingeckoPlatform
    {
        return match ($chainId) {
            Chain::ETH->value => CoingeckoPlatform::Ethereum,
            Chain::Polygon->value => CoingeckoPlatform::Polygon,
            default => null,
        };
    }
}
