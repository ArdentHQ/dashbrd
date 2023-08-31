<?php

declare(strict_types=1);

use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Models\CoingeckoToken;
use App\Models\Token;
use App\Services\MarketData\Providers\CoingeckoProvider;
use App\Support\Facades\Coingecko;

it('can get IDs of top tokens', function () {
    Coingecko::shouldReceive('topTokenIds')->andReturn([1, 2]);

    $provider = new CoingeckoProvider();

    expect($provider->topTokenIds())->toBe([1, 2]);
});

it('should fetch batch price history', function () {
    $provider = new CoingeckoProvider();

    Token::factory()->create([
        'symbol' => 'ETH',
        'name' => 'Ethereum',
    ]);
    Token::factory()->create([
        'symbol' => 'Matic',
        'name' => 'Polygon',
    ]);
    CoingeckoToken::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'coingecko_id' => 'matic-network',
    ]);
    CoingeckoToken::factory()->create([
        'symbol' => 'ETH',
        'name' => 'Ethereum',
        'coingecko_id' => 'eth',
    ]);

    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/*' => Coingecko::response(fixtureData('coingecko.market_chart'), 200),
    ]);

    $result = $provider->getBatchPriceHistory(
        tokens: Token::all(),
        currency: CurrencyCode::USD,
        period: Period::MONTH,
    );

    expect($result->first())->toHaveCount(289);

    expect($result->first()[0]->timestamp)->toBe(1678836069765);

    expect($result->first()[0]->price)->toBe(1.1917424918923705);

    expect($result->keys())->toHaveCount(2);

    expect($result->keys()->toArray())->toEqualCanonicalizing(['ETH', 'Matic']);
});

it('should fetch batch price history with a sample', function () {
    $provider = new CoingeckoProvider();

    Token::factory()->create([
        'symbol' => 'ETH',
        'name' => 'Ethereum',
    ]);
    Token::factory()->create([
        'symbol' => 'Matic',
        'name' => 'Polygon',
    ]);
    CoingeckoToken::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'coingecko_id' => 'matic-network',
    ]);
    CoingeckoToken::factory()->create([
        'symbol' => 'ETH',
        'name' => 'Ethereum',
        'coingecko_id' => 'eth',
    ]);

    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/*' => Coingecko::response(fixtureData('coingecko.market_chart'), 200),
    ]);

    $result = $provider->getBatchPriceHistory(
        tokens: Token::all(),
        currency: CurrencyCode::USD,
        period: Period::MONTH,
        sampleCount: 20
    );

    expect($result->first())->toHaveCount(20);

    expect($result->first()[0]->timestamp)->toBe(1678836069765);

    expect($result->first()[0]->price)->toBe(1.1917424918923705);

    expect($result->keys())->toHaveCount(2);

    expect($result->keys()->toArray())->toEqualCanonicalizing(['ETH', 'Matic']);
});

it('should handle api errors for single tokens', function () {
    $provider = new CoingeckoProvider();

    Token::factory()->create([
        'symbol' => 'ETH',
        'name' => 'Ethereum',
    ]);
    Token::factory()->create([
        'symbol' => 'Matic',
        'name' => 'Polygon',
    ]);
    CoingeckoToken::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'coingecko_id' => 'matic-network',
    ]);
    CoingeckoToken::factory()->create([
        'symbol' => 'ETH',
        'name' => 'Ethereum',
        'coingecko_id' => 'eth',
    ]);

    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/matic-network/market_chart*' => Coingecko::response(fixtureData('coingecko.market_chart'), 200),
        'https://api.coingecko.com/api/v3/coins/eth/market_chart*' => Coingecko::response([], 500),
    ]);

    $result = $provider->getBatchPriceHistory(
        tokens: Token::all(),
        currency: CurrencyCode::USD,
        period: Period::MONTH,
    );

    expect($result->keys())->toHaveCount(1);

    expect($result->keys()[0])->toBe('Matic');
});

it('should filter tokens without coingecko id', function () {
    $provider = new CoingeckoProvider();

    Token::factory()->create([
        'symbol' => 'ETH',
        'name' => 'Ethereum',
    ]);
    Token::factory()->create([
        'symbol' => 'Matic',
        'name' => 'Polygon',
    ]);
    CoingeckoToken::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'coingecko_id' => 'matic-network',
    ]);

    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/*' => Coingecko::response(fixtureData('coingecko.market_chart'), 200),
    ]);

    $result = $provider->getBatchPriceHistory(
        tokens: Token::all(),
        currency: CurrencyCode::USD,
        period: Period::MONTH,
    );

    expect($result->keys())->toHaveCount(1);

    expect($result->keys()[0])->toBe('Matic');
});
