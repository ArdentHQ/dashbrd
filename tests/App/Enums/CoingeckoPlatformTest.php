<?php

declare(strict_types=1);

use App\Enums\Chain;
use App\Enums\CoingeckoPlatform;

it('should return chain', function () {
    expect(CoingeckoPlatform::Polygon->toChain())->toEqual(Chain::Polygon);
});

it('should match chainId', function (int $chainId, CoingeckoPlatform $platform) {
    expect(CoingeckoPlatform::tryFromChainId($chainId))->toEqual($platform);
})->with([
    'ETH' => [Chain::ETH->value, CoingeckoPlatform::Ethereum],
    'Polygon' => [Chain::Polygon->value, CoingeckoPlatform::Polygon],
]);

it('should return null if no match found', function (int $chainId) {
    expect(CoingeckoPlatform::tryFromChainId($chainId))->toBeNull();
})->with([
    2,
    400,
    99999,
]);
