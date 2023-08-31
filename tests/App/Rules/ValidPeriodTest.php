<?php

declare(strict_types=1);

use App\Enums\Period;
use App\Rules\ValidPeriod;

it('should pass for all period codes', function ($period) {
    expect(new ValidPeriod())->passes('period', $period)->toBeTrue();
})->with(Period::codes());

it('should fail for a random period', function () {
    expect(new ValidPeriod())->passes('period', '3m')->toBeFalse();
});

it('should have a message', function () {
    expect(new ValidPeriod())->message()->toBe('The period you provided is invalid or not supported.');
});
