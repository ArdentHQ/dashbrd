<?php

declare(strict_types=1);

use App\Enums\Chains;

it('should return native currency', function (Chains $chain, string $expected) {
    expect($chain->nativeCurrency())->toBe($expected);
})->with([
    [Chains::ETH, 'ETH'],
    [Chains::Goerli, 'ETH'],
    [Chains::Polygon, 'MATIC'],
    [Chains::Mumbai, 'MATIC'],
]);
