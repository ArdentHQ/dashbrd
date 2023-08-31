<?php

declare(strict_types=1);

use App\Models\Balance;
use App\Models\CoingeckoToken;
use App\Models\Token;
use App\Support\Facades\Coingecko;

it('gets the price history for selected user wallets tokens', function () {
    $user = createUser();

    $wallet = $user->wallet;

    Token::factory()->onPolygonNetwork()->create([
        'symbol' => 'ETH',
        'name' => 'Ethereum',
    ]);

    CoingeckoToken::factory()->create([
        'symbol' => 'ETH',
        'name' => 'Ethereum',
        'coingecko_id' => 'eth',
    ]);

    CoingeckoToken::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'coingecko_id' => 'matic',
    ]);

    $tokens = Token::all();

    $wallet->balances()->saveMany($tokens->map(static function (Token $token) use ($wallet) {
        return new Balance([
            'wallet_id' => $wallet['id'],
            'token_id' => $token['id'],
            'balance' => '0',
        ]);
    }));

    $walletTokens = $wallet->tokens;

    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/*' => Coingecko::response(fixtureData('coingecko.market_chart'), 200),
    ]);

    $response = $this->actingAs($user)
        ->post(route('line_chart_data', [
            'currency' => 'USD',
            'symbols' => 'ETH,MATIC',
        ]))
        ->assertSuccessful();

    $prices = $response->json();

    expect($prices)->toBeArray();

    // ETH token + MATIC added by default in controller tests
    expect($prices)->toHaveCount(2);

    expect(array_keys($prices))->toEqualCanonicalizing($walletTokens->pluck('symbol')->toArray());

    expect(array_values($prices)[0][0])->toEqual([
        'timestamp' => 1678836069765,
        'price' => 1.1917424918923705,
    ]);
});
