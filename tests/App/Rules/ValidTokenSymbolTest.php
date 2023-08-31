<?php

declare(strict_types=1);

use App\Models\Token;
use App\Rules\ValidTokenSymbol;

it('should pass for existing token', function () {
    Token::factory()->create([
        'symbol' => 'ALFY',
    ]);

    expect(new ValidTokenSymbol())->passes('token', 'ALFY')->toBeTrue();

    expect(new ValidTokenSymbol())->passes('token', 'alfy')->toBeTrue();
});

it('should fail for an unexisting token', function () {
    expect(new ValidTokenSymbol())->passes('token', 'aly')->toBeFalse();
});

it('should have a message', function () {
    expect(new ValidTokenSymbol())->message()->toBe('The token symbol you provided is invalid or not supported.');
});
