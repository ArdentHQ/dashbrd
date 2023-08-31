<?php

declare(strict_types=1);

use App\Enums\Chains;
use App\Enums\MnemonicChain;

it('should determine chain from id', function (Chains $chain, MnemonicChain $expected) {
    expect(MnemonicChain::fromChain($chain))->toBe($expected);
})->with([
    'ETH' => [Chains::ETH, MnemonicChain::Ethereum],
    'Polygon' => [Chains::Polygon, MnemonicChain::Polygon],
]);

it('should throw exception if chain not supported', function (Chains $chain) {
    expect(fn () => MnemonicChain::fromChain($chain))->toThrow(\InvalidArgumentException::class);
})->with([
    Chains::Mumbai,
    Chains::Goerli,
]);
