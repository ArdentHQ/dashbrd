<?php

declare(strict_types=1);

use App\Enums\Chain;
use App\Enums\MnemonicChain;

it('should determine chain from id', function (Chain $chain, MnemonicChain $expected) {
    expect(MnemonicChain::fromChain($chain))->toBe($expected);
})->with([
    'ETH' => [Chain::ETH, MnemonicChain::Ethereum],
    'Polygon' => [Chain::Polygon, MnemonicChain::Polygon],
]);

it('should throw exception if chain not supported', function (Chain $chain) {
    expect(fn () => MnemonicChain::fromChain($chain))->toThrow(\InvalidArgumentException::class);
})->with([
    Chain::Mumbai,
    Chain::Goerli,
]);
