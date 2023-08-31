<?php

declare(strict_types=1);

namespace App\Enums;

enum Period: string
{
    case DAY = '24h';
    case WEEK = '7d';
    case MONTH = '30d';
    case YEAR = '1y';
    case YEARS_15 = '15y';

    public static function days(Period $period): int
    {
        return match ($period) {
            self::DAY => 1,
            self::WEEK => 7,
            self::MONTH => 30,
            self::YEAR => 365,
            self::YEARS_15 => 5500,
        };
    }

    /**
     * @return string[]
     */
    public static function codes(): array
    {
        return [
            self::DAY->value,
            self::WEEK->value,
            self::MONTH->value,
            self::YEAR->value,
            self::YEARS_15->value,
        ];
    }

    public static function isValid(string $value): bool
    {
        return in_array($value, self::codes(), true);
    }
}
