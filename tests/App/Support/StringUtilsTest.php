<?php

declare(strict_types=1);

namespace Tests\App\Support;

use Illuminate\Support\Str;

it('should wrap the string in double quotes', function ($value, $expected) {
    expect(Str::wrapInQuotes($value))->toBe($expected);
})->with([
    ['', '""'],
    ['a', '"a"'],
    ['Test', '"Test"'],
    [' ', '" "'],
    ['"', '"\""'],
    ['"\"\\"', '"\"\\\"\\\""'],
]);
