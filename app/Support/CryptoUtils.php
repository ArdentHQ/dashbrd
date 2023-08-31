<?php

declare(strict_types=1);

namespace App\Support;

use Brick\Math\BigDecimal;
use Brick\Math\BigInteger;
use Brick\Math\RoundingMode;
use Illuminate\Support\Str;

final class CryptoUtils
{
    public static function convertToWei(string|float $amount, int $decimals): string
    {
        return strval(
            BigDecimal::of($amount)
                ->toScale($decimals, RoundingMode::DOWN)
                ->multipliedBy(BigInteger::ten()->power($decimals))
                ->toBigInteger()
        );
    }

    public static function hexToBigIntStr(string $value): string
    {
        /** @var string */
        $value = Str::replace('0x', '', $value);

        return strval(BigInteger::fromBase($value, 16));
    }
}
