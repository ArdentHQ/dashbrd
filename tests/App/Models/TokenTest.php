<?php

declare(strict_types=1);

use App\Contracts\MarketDataProvider;
use App\Enums\CurrencyCode;
use App\Http\Client\MarketData\Data\CoingeckoTokenData;
use App\Models\Balance;
use App\Models\CoingeckoToken;
use App\Models\Network;
use App\Models\SpamToken;
use App\Models\Token;
use App\Models\Wallet;
use App\Support\Facades\Coingecko;

it('can create a basic token', function () {
    $token = Token::factory()->create();

    expect($token->address)->not()->toBeNull();
});

it('can get token images', function () {
    $token = Token::factory()->create([
        'extra_attributes' => [
            'images' => [
                'thumb' => 'https://example.com/thumb.png',
                'small' => 'https://example.com/small.png',
                'large' => 'https://example.com/large.png',
            ],
        ],
    ]);

    expect($token->images())->toEqual(
        [
            'thumb' => 'https://example.com/thumb.png',
            'small' => 'https://example.com/small.png',
            'large' => 'https://example.com/large.png',
        ]
    );
});

it('can get token marketCap', function () {
    $token = Token::factory()->create([
        'extra_attributes' => [
            'market_data' => [
                'market_cap' => [
                    'usd' => 123456789.01,
                    'eur' => 555555.01,
                ],
            ],
        ],
    ]);

    expect($token->marketCap(CurrencyCode::USD))->toBe(123456789.01)
        ->and($token->marketCap(CurrencyCode::EUR))->toBe(555555.01)
        ->and($token->marketCap(CurrencyCode::RUB))->toBeNull();
});

it('can get token volume', function () {
    $token = Token::factory()->create([
        'extra_attributes' => [
            'market_data' => [
                'total_volume' => [
                    'usd' => 123456789.01,
                    'eur' => 666666.01,
                ],
            ],
        ],
    ]);

    expect($token->volume(CurrencyCode::USD))->toBe(123456789.01)
        ->and($token->volume(CurrencyCode::EUR))->toBe(666666.01)
        ->and($token->volume(CurrencyCode::RUB))->toBeNull();
});

it('can set additional token details', function () {
    Coingecko::shouldReceive('token')
        ->once()
        ->with('testy')
        ->andReturn(new CoingeckoTokenData(fixtureData('coingecko.coins_bitcoin')));

    $network = Network::polygon()->firstOrFail();

    $token = Token::factory()->create([
        'symbol' => 'TEST',
        'name' => 'Test',
        'extra_attributes' => null,
        'network_id' => $network->id,
    ]);

    CoingeckoToken::factory()->create([
        'symbol' => 'TEST',
        'name' => 'Test',
        'coingecko_id' => 'testy',
    ]);

    $details = app(MarketDataProvider::class)->getTokenDetails($token);

    expect($token->address)->not()->toBeNull();
    expect($token->extra_attributes->market_data)->toBeNull();
    expect($token->extra_attributes->images)->toBeNull();

    $token->setTokenDetails($details);
    $token->save();
    $token->refresh();

    expect($token->extra_attributes->market_data)->toBeArray();
    expect($token->extra_attributes->images)->toBeArray();
});

it('ignores spam tokens', function () {
    $polygonNetwork = Network::polygon()->firstOrFail();

    $tokens = Token::factory(2)->create([
        'network_id' => $polygonNetwork->id,
    ]);

    expect(Token::withoutSpam()->count())->toBe(2);

    SpamToken::factory()->create([
        'token_id' => $tokens->first()->id,
    ]);

    expect(Token::withoutSpam()->count())->toBe(1);
    expect(Token::get()->count())->toBe(2);
});

it('ignores spam tokens on mainnet by default', function () {
    $polygonNetwork = Network::polygon()->firstOrFail();

    $tokens = Token::factory(2)->create([
        'network_id' => $polygonNetwork->id,
    ]);

    expect(Token::mainnet()->count())->toBe(2);

    SpamToken::factory()->create([
        'token_id' => $tokens->first()->id,
    ]);

    expect(Token::mainnet()->count())->toBe(1);

    SpamToken::factory()->create([
        'token_id' => $tokens->last()->id,
    ]);

    expect(Token::mainnet()->count())->toBe(0);
});

it('prioritize tokens without market cap', function () {
    $tokenWith0Tokens = Token::factory()->withMarketCap(0)->create();
    $tokenWith2Tokens = Token::factory()->withMarketCap(0)->create();
    $tokenWith8Tokens = Token::factory()->withMarketCap(0)->create();
    $tokenWith4Tokens = Token::factory()->withMarketCap(0)->create();

    Balance::factory()->count(2)->create([
        'token_id' => $tokenWith2Tokens->id,
    ]);

    Balance::factory()->count(8)->create([
        'token_id' => $tokenWith8Tokens->id,
    ]);

    Balance::factory()->count(4)->create([
        'token_id' => $tokenWith4Tokens->id,
    ]);

    $tokens = Token::prioritized()->get();

    expect($tokens->pluck('id')->toArray())->toEqual([
        $tokenWith8Tokens->id,
        $tokenWith4Tokens->id,
        $tokenWith2Tokens->id,
        $tokenWith0Tokens->id,
    ]);
});

it('prioritize tokens by market cap', function () {
    $tokenWith0 = Token::factory()->withMarketCap(0)->create();
    $tokenWith2 = Token::factory()->withMarketCap(2_000_000_000)->create();
    $tokenWith8 = Token::factory()->withMarketCap(8_000_000_000)->create();
    $tokenWith4 = Token::factory()->withMarketCap(4_000_000_000)->create();

    $tokens = Token::prioritized()->get();

    expect($tokens->pluck('id')->toArray())->toEqual([
        $tokenWith8->id,
        $tokenWith4->id,
        $tokenWith2->id,
        $tokenWith0->id,
    ]);
});

it('prioritize tokens by recently active', function () {
    $this->freezeTime();

    $tokenWith0 = Token::factory()->withMarketCap(0)->create();
    $tokenWith2 = Token::factory()->withMarketCap(0)->create();
    $tokenWith8 = Token::factory()->withMarketCap(0)->create();
    $tokenWith4 = Token::factory()->withMarketCap(0)->create();

    // Add 10 not recently active: 10 points
    Balance::factory()->count(10)->create([
        'token_id' => $tokenWith0->id,
        'wallet_id' => fn () => Wallet::factory()->inactive(),
    ]);

    // 20 points + 10 points = 30 points
    Balance::factory()->count(2)->create([
        'token_id' => $tokenWith2->id,
        'wallet_id' => fn () => Wallet::factory()->recentlyActiveButNotOnline(),
    ]);
    // Add some not recently active to make it 10: 10 points + 20 points = 30 points
    Balance::factory()->count(8)->create([
        'token_id' => $tokenWith2->id,
        'wallet_id' => fn () => Wallet::factory()->inactive(),
    ]);

    // 80 points + 10 points = 90 points
    Balance::factory()->count(8)->create([
        'token_id' => $tokenWith8->id,
        'wallet_id' => fn () => Wallet::factory()->recentlyActiveButNotOnline(),
    ]);
    // Add some not recently active to make it 10
    Balance::factory()->count(2)->create([
        'token_id' => $tokenWith8->id,
        'wallet_id' => fn () => Wallet::factory()->inactive(),
    ]);

    // 40 points + 10 points = 50 points
    Balance::factory()->count(4)->create([
        'token_id' => $tokenWith4->id,
        'wallet_id' => fn () => Wallet::factory()->recentlyActiveButNotOnline(),
    ]);
    // Add some not recently active to make it 10
    Balance::factory()->count(6)->create([
        'token_id' => $tokenWith4->id,
        'wallet_id' => fn () => Wallet::factory()->inactive(),
    ]);

    $tokens = Token::prioritized()->get();

    expect($tokens->pluck('points')->toArray())->toEqualCanonicalizing([
        90,
        50,
        30,
        10,
    ]);

    expect($tokens->pluck('id')->toArray())->toEqual([
        $tokenWith8->id,
        $tokenWith4->id,
        $tokenWith2->id,
        $tokenWith0->id,
    ]);
});

it('prioritize tokens by online status', function () {
    $this->freezeTime();

    $tokenWith0 = Token::factory()->withMarketCap(0)->create();
    $tokenWith2 = Token::factory()->withMarketCap(0)->create();
    $tokenWith8 = Token::factory()->withMarketCap(0)->create();
    $tokenWith4 = Token::factory()->withMarketCap(0)->create();

    // Add 10 not recently active: 10 points
    Balance::factory()->count(10)->create([
        'token_id' => $tokenWith0->id,
        'wallet_id' => fn () => Wallet::factory()->inactive(),
    ]);

    // 100 + 20 points + 10 points = 130 points
    Balance::factory()->count(2)->create([
        'token_id' => $tokenWith2->id,
        'wallet_id' => fn () => Wallet::factory()->online(),
    ]);
    // Add some not recently active to make it 10: 10 points + 20 points = 30 points
    Balance::factory()->count(8)->create([
        'token_id' => $tokenWith2->id,
        'wallet_id' => fn () => Wallet::factory()->inactive(),
    ]);

    // 400 points + 80 points + 10 points = 490 points
    Balance::factory()->count(8)->create([
        'token_id' => $tokenWith8->id,
        'wallet_id' => fn () => Wallet::factory()->online(),
    ]);
    // Add some not recently active to make it 10
    Balance::factory()->count(2)->create([
        'token_id' => $tokenWith8->id,
        'wallet_id' => fn () => Wallet::factory()->inactive(),
    ]);

    //  200 points + 40 + 10 points = 250 points
    Balance::factory()->count(4)->create([
        'token_id' => $tokenWith4->id,
        'wallet_id' => fn () => Wallet::factory()->online(),
    ]);
    // Add some not recently active to make it 10
    Balance::factory()->count(6)->create([
        'token_id' => $tokenWith4->id,
        'wallet_id' => fn () => Wallet::factory()->inactive(),
    ]);

    $tokens = Token::prioritized()->get();

    expect($tokens->pluck('points')->toArray())->toEqualCanonicalizing([
        490,
        250,
        130,
        10,
    ]);

    expect($tokens->pluck('id')->toArray())->toEqual([
        $tokenWith8->id,
        $tokenWith4->id,
        $tokenWith2->id,
        $tokenWith0->id,
    ]);
});
