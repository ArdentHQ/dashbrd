<?php

declare(strict_types=1);

use App\Support\Currency;
use Illuminate\Support\Collection;

it('can find specific currency', function () {
    expect(Currency::find('EUR'))->toBe('EUR');
    expect(Currency::find('Unknown', default: 'USD'))->toBe('USD');
});

it('can get all currency codes', function () {
    $code = Currency::codes();

    expect($code)->toBeInstanceOf(Collection::class);
    expect($code)->toContain('USD');
});

it('can get all currencies', function () {
    $currencies = Currency::all();

    expect($currencies)->toBeInstanceOf(Collection::class);

    $usd = $currencies->first(fn ($currency) => $currency->code === 'USD');

    expect($usd)->toBeInstanceOf(Currency::class);
    expect($usd->name)->toBe('US Dollar');
    expect($usd->code)->toBe('USD');
    expect($usd->symbol)->toBe('$');
});

it('can convert currency to array', function () {
    $currency = (new Currency(
        name: 'US Dollar',
        code: 'USD',
        symbol: '$'
    ))->toArray();

    expect($currency)->toBe([
        'name' => 'US Dollar',
        'code' => 'USD',
        'symbol' => '$',
    ]);
});
