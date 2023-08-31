<?php

declare(strict_types=1);

use App\Contracts\MarketDataProvider;
use App\Data\PriceHistoryData;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Jobs\FetchPriceHistory;
use App\Models\Token;

it('should fetch price history for a token for the given currency and period', function () {
    $token = Token::factory()->withGuid()->create();

    $this->mock(MarketDataProvider::class, function ($mock) use ($token) {
        $mock->shouldReceive('getPriceHistory')
            ->withArgs(function (Token $tokenParam, $currency, $period) use ($token) {
                return $tokenParam->is($token)
                    && $currency === CurrencyCode::USD
                    && $period === Period::DAY;
            })
            ->once()
            ->andReturn(PriceHistoryData::collection([]))
            ->once();
    });

    $period = Period::DAY;
    $currency = 'USD';

    FetchPriceHistory::dispatch($token, $period, $currency);
});

it('should have middlewares', function () {
    $token = Token::factory()->create();
    $period = Period::DAY;
    $currency = 'USD';

    $middlewares = (new FetchPriceHistory($token, $period, $currency))->middleware();

    expect($middlewares)->toBeArray();
});

it('should store fetched price history in database', function () {
    $token = Token::factory()->withGuid()->create();

    $this->mock(MarketDataProvider::class, function ($mock) use ($token) {
        $mock->shouldReceive('getPriceHistory')
            ->withArgs(function (Token $tokenParam, $currency, $period) use ($token) {
                return $tokenParam->is($token)
                    && $currency === CurrencyCode::USD
                    && $period === Period::DAY;
            })
            ->once()
            ->andReturn(PriceHistoryData::collection([
                [
                    'timestamp' => 1686137143000,
                    'price' => 1400,
                ],
                [
                    'timestamp' => 1685964343000,
                    'price' => 1410,
                ],
            ]))
            ->once();
    });

    $period = Period::DAY;
    $currency = 'USD';

    FetchPriceHistory::dispatch($token, $period, $currency);

    expect($token->priceHistory()->get())->toHaveCount(2);
});

it('should handle missing token guid gracefully', function () {
    $token = Token::factory()->create(['token_guid' => null]);

    $period = Period::DAY;
    $currency = 'USD';

    FetchPriceHistory::dispatch($token, $period, $currency);

    expect($token->priceHistory()->get())->toHaveCount(0);
});
