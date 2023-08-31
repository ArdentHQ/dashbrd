<?php

declare(strict_types=1);

use App\Http\Client\MarketData\Data\CoingeckoTokenData;
use App\Http\Client\MarketData\Data\CoingeckoTokens;
use App\Support\Facades\Coingecko;
use Illuminate\Support\Facades\Http;

it('can use the facade to list the coins', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/list?*' => Http::response(fixtureData('coingecko.coins_list'), 200),
    ]);

    $tokens = Coingecko::tokens();

    expect($tokens)->toBeInstanceOf(CoingeckoTokens::class);
    expect($tokens->list())->toHaveCount(11458);
});

it('can use the facade to list the top token ids', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/markets?*' => Http::response(fixtureData('coingecko.coins_markets'), 200),
    ]);

    $tokens = Coingecko::topTokenIds();

    expect($tokens)->toBeArray();

    expect($tokens)->toHaveCount(250);
});

it('can use the facade to get the coin details', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/bitcoin?*' => Http::response(fixtureData('coingecko.coins_bitcoin'), 200),
    ]);

    $tokens = Coingecko::token('bitcoin');

    expect($tokens)->toBeInstanceOf(CoingeckoTokenData::class);

    expect($tokens->marketCaps()['usd'])->toBe(457405642741);
    expect($tokens->totalVolumes()['usd'])->toBe(32299852560);
    expect($tokens->ath()['usd'])->toBe(69045);
    expect($tokens->atl()['usd'])->toBe(67.81);
    expect($tokens->currentPrices()['usd'])->toBe(23636);
    expect($tokens->currentPrices()['eur'])->toBe(22155);
    expect($tokens->mintedSupply())->toBe(21000000.0);
    expect($tokens->images())->toEqual([
        'thumb' => 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png?1547033579',
        'small' => 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579',
        'large' => 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579',
    ]);
    expect($tokens->twitterUsername())->toBe('TestTwitter');
    expect($tokens->websiteUrl())->toBe('https://example.com');
    expect($tokens->discordUrl())->toBe('https://discord.com/test');
});

it('ensures website starts with https', function () {
    $token = new CoingeckoTokenData(array_merge(fixtureData('coingecko.coins_bitcoin'), [
        'links' => [
            'homepage' => ['', 'https://example.com'],
        ],
    ]));

    expect($token->websiteUrl())->toBe('https://example.com');

    $token = new CoingeckoTokenData(array_merge(fixtureData('coingecko.coins_bitcoin'), [
        'links' => [
            'homepage' => ['', 'non-http-example.com'],
        ],
    ]));

    expect($token->websiteUrl())->toBe('https://non-http-example.com');

    $token = new CoingeckoTokenData(array_merge(fixtureData('coingecko.coins_bitcoin'), [
        'links' => [
            'homepage' => ['', 'http://http-example.com'],
        ],
    ]));

    expect($token->websiteUrl())->toBe('http://http-example.com');
});

it('ensures twitter is handling accordingly', function () {
    $token = new CoingeckoTokenData(array_merge(fixtureData('coingecko.coins_bitcoin'), [
        'links' => [
            'twitter_screen_name' => null,
        ],
    ]));

    expect($token->twitterUsername())->toBe(null);

    $token = new CoingeckoTokenData(array_merge(fixtureData('coingecko.coins_bitcoin'), [
        'links' => [
            'twitter_screen_name' => '',
        ],
    ]));

    expect($token->twitterUsername())->toBe(null);

    $token = new CoingeckoTokenData(array_merge(fixtureData('coingecko.coins_bitcoin'), [
        'links' => [
            'twitter_screen_name' => 'test',
        ],
    ]));

    expect($token->twitterUsername())->toBe('test');
});

it('can use the facade to get the currencies', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/simple/supported_vs_currencies' => Http::response(fixtureData('coingecko.currencies'), 200),
    ]);

    $currencies = Coingecko::currencies();

    expect($currencies)->toBeArray();
});

it('can use the facade to get marketChart data', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/matic-network/market_chart*' => Http::response(fixtureData('coingecko.market_chart'), 200),
    ]);

    $currencies = Coingecko::marketChart(
        id: 'matic-network',
        vsCurrency: 'usd',
        days: 1,
    );

    $prices = $currencies->prices();

    expect($prices)->toBeArray();

    expect($prices)->toHaveCount(289);

    expect($prices[0])->toEqual([
        1678836069765,
        1.1917424918923705,
    ]);
});
