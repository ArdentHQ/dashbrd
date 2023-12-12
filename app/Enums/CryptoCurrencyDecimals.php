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
        return match (Str::upper($currency)) {
            'ETH' => self::ETH->value,
            'USDC' => self::USDC->value,
            default => self::ETH->value,
        };
    }
}
