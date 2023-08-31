<?php

declare(strict_types=1);

use App\Enums\AlchemyChain;

it('should determine chain from id', function (int $chainId, AlchemyChain $expected) {
    expect(AlchemyChain::fromChainId($chainId))->toBe($expected);
})->with([
    'ETH' => [1, AlchemyChain::EthereumMainnet],
    'Goerli' => [5, AlchemyChain::EthereumTestnet],
    'Polygon' => [137, AlchemyChain::PolygonMainnet],
    'Mumbai' => [80001, AlchemyChain::PolygonTestnet],
]);

it('should throw exception if chain id not found', function (int $chainId) {
    expect(fn () => AlchemyChain::fromChainId($chainId))->toThrow(\InvalidArgumentException::class);
})->with([
    2,
    400,
    99999,
]);
