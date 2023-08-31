<?php

declare(strict_types=1);

use App\Models\Token;
use App\Models\TokenPrice;

it('can create a basic token price', function () {
    $tokenPrice = TokenPrice::factory()->create();

    expect($tokenPrice->price)->not()->toBeNull();
});

it('belongs to a token', function () {
    $token = Token::factory()->withGuid('testy')->create();
    $tokenPrice = TokenPrice::factory()->create([
        'token_guid' => $token->token_guid,
    ]);

    expect($tokenPrice->token->id)->toBe($token->id);
});
