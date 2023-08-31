<?php

declare(strict_types=1);

use App\Models\CoingeckoToken;
use App\Support\Facades\Coingecko;
use Illuminate\Support\Facades\Http;

it('should update the coingecko token table', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/list?*' => Http::response(fixtureData('coingecko.coins_list_small'), 200),
    ]);

    dispatch(new \App\Jobs\FetchCoingeckoTokens());

    expect(CoingeckoToken::count())->toBe(26);
});

it('should create non previously registered tokens', function () {
    CoingeckoToken::factory()->create([
        'symbol' => 'TEST',
        'name' => 'test',
        'coingecko_id' => 'test',
    ]);

    expect(CoingeckoToken::count())->toBe(1);

    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/list?*' => Http::response(fixtureData('coingecko.coins_list_small'), 200),
    ]);

    dispatch(new \App\Jobs\FetchCoingeckoTokens());

    expect(CoingeckoToken::count())->toBe(27);
});

it('should update previous registered tokens', function () {
    $token = CoingeckoToken::factory()->create([
        'symbol' => 'TEST',
        'name' => 'test',
        'coingecko_id' => '0chain',
    ]);

    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/list?*' => Http::response(fixtureData('coingecko.coins_list_small'), 200),
    ]);

    dispatch(new \App\Jobs\FetchCoingeckoTokens());

    $updatedToken = CoingeckoToken::where('coingecko_id', $token->coingecko_id)->firstOrFail();
    expect($updatedToken->name)->not->toBe($token->name);
    expect($updatedToken->symbol)->not->toBe($token->symbol);
    expect($updatedToken->platforms)->not->toBe($token->platforms);
});

it('should register tokens with multiple platforms', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/list?*' => Http::response(fixtureData('coingecko.coins_list_multiple_platforms'), 200),
    ]);

    dispatch(new \App\Jobs\FetchCoingeckoTokens());

    expect(CoingeckoToken::count())->toBe(2);
});

it('should filter just supported platforms for tokens', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/list?*' => Http::response(fixtureData('coingecko.coins_list_multiple_platforms'), 200),
    ]);

    dispatch(new \App\Jobs\FetchCoingeckoTokens());

    $tokenWithMultiplePlatforms = CoingeckoToken::where('coingecko_id', 'weth')->firstOrFail();

    $platforms = json_decode($tokenWithMultiplePlatforms->platforms);
    expect(count(get_object_vars($platforms)))->toBe(2); // Just 2: ethereum and polygon-pos
});

it('should register a token with no platforms', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/list?*' => Http::response(fixtureData('coingecko.coins_list_small'), 200),
    ]);

    dispatch(new \App\Jobs\FetchCoingeckoTokens());

    $tokenWithNoPlatforms = CoingeckoToken::where('coingecko_id', '01coin')->firstOrFail();

    expect($tokenWithNoPlatforms->platforms)->toBe('[]');
});
