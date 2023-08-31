<?php

declare(strict_types=1);

use App\Models\Balance;
use App\Models\Token;
use App\Models\Wallet;

it('can create a basic balance', function () {
    $balance = Balance::factory()->create();

    expect($balance->balance)->not()->toBeNull();
});

it('belongs to a token', function () {
    $token = Token::factory()->create();
    $balance = Balance::factory()->create([
        'token_id' => $token->id,
    ]);

    expect($balance->token->id)->toBe($token->id);
});

it('belongs to a wallet', function () {
    $wallet = Wallet::factory()->create();
    $balance = Balance::factory()->create([
        'wallet_id' => $wallet->id,
    ]);

    expect($balance->wallet->id)->toBe($wallet->id);
});
