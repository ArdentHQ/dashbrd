<?php

declare(strict_types=1);

use App\Enums\MoralisChain;

it('should determine chain from id', function (int $chainId, MoralisChain $expected) {
    expect(MoralisChain::fromChainId($chainId))->toBe($expected);
})->with([
    'ETH' => [1, MoralisChain::ETH],
    'Goerli' => [5, MoralisChain::Goerli],
    'Polygon' => [137, MoralisChain::Polygon],
    'Mumbai' => [80001, MoralisChain::Mumbai],
]);

it('should throw exception if chain id not found', function (int $chainId) {
    expect(fn () => MoralisChain::fromChainId($chainId))->toThrow(\InvalidArgumentException::class);
})->with([
    2,
    400,
    99999,
]);
