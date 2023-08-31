<?php

declare(strict_types=1);

use App\Rules\WalletAddress;

it('should pass with valid address', function (string $address) {
    expect(new WalletAddress())->passes(null, $address)->toBeTrue();
})->with([
    '0x1231231231231231231231231231231231231231',
    '0x1234567890123456789012345678901234567890',
    '0x0000000000000000000000000000000000001010',
    '0xb3323081d7c7d680b94d1918151185677566bc13',
    '0xb30aa83924fc18c3bc4621f542b82f7862ca55b1',
]);

it('should fail with invalid address', function (string $address) {
    expect(new WalletAddress())->passes(null, $address)->toBeFalse();
})->with([
    '0x1231',
    '0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
    '0000000000000000000000000000000000001010',
    '0231170305080f62b803ce0271cae547cbf84e5627',
    '1xb30aa83924fc18c3bc4621f542b82f7862ca55b1',
]);

it('should have a message', function () {
    expect(new WalletAddress())->message()->toBe(trans('auth.validation.invalid_address'));
});
