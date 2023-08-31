<?php

declare(strict_types=1);

namespace App\Enums;

use Illuminate\Support\Str;

enum CryptoCurrencyDecimals: int
{
    case ETH = 18;
    case USDC = 6;

    public static function forCurrency(string $currency): int
    {
        $currency = Str::upper($currency);

        if (self::contains($currency)) {
            return constant(self::class.'::'.$currency)->value;
        }

        return self::ETH->value;
    }

    private static function contains(string $currency): bool
    {
        return in_array($currency, array_column(self::cases(), 'name'));
    }
}
