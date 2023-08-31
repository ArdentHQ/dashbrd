<?php

declare(strict_types=1);

use App\Enums\CryptoCurrencyDecimals;

it('should return number of decimals', function ($token, $decimals) {
    expect(CryptoCurrencyDecimals::forCurrency($token))->toBe($decimals);
})->with([
    'ETH' => ['ETH', 18],
    'USDC' => ['USDC', 6],
    'LINK' => ['LINK', 18],
]);

it('should return number of decimals case insensitive', function ($token, $decimals) {
    expect(CryptoCurrencyDecimals::forCurrency($token))->toBe($decimals);
})->with([
    'ETH' => ['ETH', 18],
    'eTH' => ['eTH', 18],
    'Usdc' => ['Usdc', 6],
    'usdc' => ['usdc', 6],
]);
