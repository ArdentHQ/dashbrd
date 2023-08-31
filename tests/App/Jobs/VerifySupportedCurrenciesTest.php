<?php

declare(strict_types=1);

use App\Contracts\MarketDataProvider;
use App\Exceptions\UnsupportedCurrencyException;
use App\Jobs\VerifySupportedCurrencies;
use App\Support\Facades\Coingecko;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

it('does not report exception if all currencies are supported', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/simple/supported_vs_currencies' => Http::response(fixtureData('coingecko.currencies'), 200),
    ]);

    (new VerifySupportedCurrencies)->handle(app(MarketDataProvider::class));

    $this->addToAssertionCount(1);
});

it('can report an exception if there are some currencies that we support but that Coingecko doesnt support', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/simple/supported_vs_currencies' => Http::response([
            'USD',
        ], 200),
    ]);

    (new VerifySupportedCurrencies)->handle(app(MarketDataProvider::class));
})->throws(UnsupportedCurrencyException::class);

it('has a backoff', function () {
    expect((new VerifySupportedCurrencies)->backoff())->toBeArray();
});

it('should have middlewares', function () {
    $middlewares = (new VerifySupportedCurrencies())->middleware();

    expect($middlewares)->toBeArray();
});

it('has a unique ID', function () {
    expect((new VerifySupportedCurrencies())->uniqueId())->toBeString();
});

it('has retryUntil', function () {
    expect((new VerifySupportedCurrencies())->retryUntil())->toBeInstanceOf(Carbon::class);
});

it('has onFailure', function () {
    (new VerifySupportedCurrencies())->onFailure(new RuntimeException);

    $this->addtoAssertionCount(1);
});
