<?php

declare(strict_types=1);

namespace Tests\App\Support;

use App\Support\StringUtils;

it('should double quote string', function ($value, $expected) {
    expect(StringUtils::doubleQuote($value))->toBe($expected);
})->with([
    ['', '""'],
    ['a', '"a"'],
    ['Test', '"Test"'],
    [' ', '" "'],
    ['"', '"\""'],
    ['"\"\\"', '"\"\\\"\\\""'],
]);
