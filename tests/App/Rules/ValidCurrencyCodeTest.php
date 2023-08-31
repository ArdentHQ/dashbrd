<?php

declare(strict_types=1);

use App\Rules\ValidCurrencyCode;
use App\Support\Currency;

it('should pass for all currency codes ignoring case', function ($currencyCode) {
    expect(new ValidCurrencyCode())->passes('currency', $currencyCode)->toBeTrue();

    expect(new ValidCurrencyCode())->passes('currency', strtolower($currencyCode))->toBeTrue();
})->with(Currency::codes());

it('should fail for a random currency code', function () {
    expect(new ValidCurrencyCode())->passes('currency', 'ALFYS')->toBeFalse();
});

it('should have a message', function () {
    expect(new ValidCurrencyCode())->message()->toBe('The currency code you provided is invalid or not supported.');
});
