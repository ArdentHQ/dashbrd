<?php

declare(strict_types=1);

use App\Data\Token\TokenData;
use App\Models\Token;
use App\Models\TokenPrice;

it('should return native token and its price data', function () {
    $user = createUser();

    $token = Token::factory()->create([
        'is_native_token' => false,
    ]);

    $nativeToken = Token::factory()->withGuid()->create([
        'network_id' => $token->network_id,
        'is_native_token' => true,
    ]);

    $userCurrency = $user->currency();

    TokenPrice::factory()->create([
        'token_guid' => $nativeToken->token_guid,
        'currency' => $userCurrency->canonical(),
        'price' => 12.50,
    ]);

    $this->actingAs($user)
        ->get(route('tokens.network-native-token', [
            'token' => $token,
            'network' => $token->network,
        ]))
        ->assertJson([
            'token' => TokenData::fromModel($nativeToken)->toArray(),
            'tokenPrice' => [
                'guid' => $nativeToken->token_guid,
                'price' => [
                    $userCurrency->value => [
                        'price' => 12.50,
                    ],
                ],
            ],
        ]);
});
