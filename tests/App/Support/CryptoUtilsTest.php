<?php

declare(strict_types=1);

use App\Support\CryptoUtils;

it('should convert hex to bigint string', function (string $value, string $expected) {
    expect(CryptoUtils::hexToBigIntStr($value))->toBe($expected);
})->with([
    ['0', '0'],
    ['1', '1'],
    ['0x01', '1'],
    ['0x7f', '127'],
    ['0xdeadbeef', '3735928559'],
    ['0xDEADBEEF', '3735928559'],
    ['0x00000000000000000000000000000000000000000000038ebad5cdc902800000', '16800000000000000000000'],
]);

it('should convert decimal to currency unit', function (string $value, int $decimals, string $expected) {
    expect(CryptoUtils::convertToWei($value, $decimals))->toBe($expected);
})->with([
    ['0', 18, '0'],
    ['1', 18, '1000000000000000000'],
    ['0.1', 18, '100000000000000000'],
    ['0.000000000000000001', 18, '1'],
    ['0', 6, '0'],
    ['1', 6, '1000000'],
    ['0.1', 6, '100000'],
    ['0.000001', 6, '1'],
    ['0.0102677925818819934', 18, '10267792581881993'],
    ['0.010267792581881993', 18, '10267792581881993'],
    ['1.010267792581881993', 18, '1010267792581881993'],
    ['100.010267792581881993', 18, '100010267792581881993'],
    ['0.0102677925818819934', 6, '10267'],
]);
