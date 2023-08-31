<?php

declare(strict_types=1);

namespace App\Support;

final class StringUtils
{
    public static function escapeDoubleQuote(string $value): string
    {
        return str_replace('"', '\"', $value);
    }

    public static function doubleQuote(string $value): string
    {
        return '"'.self::escapeDoubleQuote($value).'"';
    }
}
