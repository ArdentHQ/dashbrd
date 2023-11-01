<?php

declare(strict_types=1);

use App\Enums\Chain;

it('should return native currency', function (Chain $chain, string $expected) {
    expect($chain->nativeCurrency())->toBe($expected);
})->with([
    [Chain::ETH, 'ETH'],
    [Chain::Goerli, 'ETH'],
    [Chain::Polygon, 'MATIC'],
    [Chain::Mumbai, 'MATIC'],
]);
