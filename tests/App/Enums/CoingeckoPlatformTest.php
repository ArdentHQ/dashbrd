<?php

declare(strict_types=1);

use App\Enums\Chains;
use App\Enums\CoingeckoPlatform;

it('should return chain', function () {
    expect(CoingeckoPlatform::Polygon->toChain())->toEqual(Chains::Polygon);
});

it('should match chainId', function (int $chainId, CoingeckoPlatform $platform) {
    expect(CoingeckoPlatform::tryFromChainId($chainId))->toEqual($platform);
})->with([
    'ETH' => [Chains::ETH->value, CoingeckoPlatform::Ethereum],
    'Polygon' => [Chains::Polygon->value, CoingeckoPlatform::Polygon],
]);

it('should return null if no match found', function (int $chainId) {
    expect(CoingeckoPlatform::tryFromChainId($chainId))->toBeNull();
})->with([
    2,
    400,
    99999,
]);
