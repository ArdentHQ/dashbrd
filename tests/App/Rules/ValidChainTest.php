<?php

declare(strict_types=1);

use App\Models\Network;
use App\Rules\ValidChain;

it('should pass if network is polygon', function () {
    $polygon = Network::polygon();

    expect(new ValidChain())->passes(null, $polygon->chain_id)->toBeTrue();
});

it('should pass if network is mumbai testnet', function () {
    config(['dashbrd.testnet_enabled' => true]);

    expect(new ValidChain())->passes(null, '80001')->toBeTrue(); // Mumbai is seeded by default

    config(['dashbrd.testnet_enabled' => false]);
});

it('should not pass if network is not supported', function () {
    expect(new ValidChain())->passes(null, '123')->toBeFalse();
});

it('should fail if no network', function () {
    $rule = new ValidChain();

    expect($rule->passes(null, '1234'))->toBeFalse();
    expect($rule->message())->toBe(trans('auth.validation.invalid_network'));
});
