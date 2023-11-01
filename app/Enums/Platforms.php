<?php

declare(strict_types=1);

namespace App\Enums;

enum Platform: string
{
    case Ethereum = 'ethereum';
    case Polygon = 'polygon-pos';

    /**
     * @return string[]
     */
    public static function all(): array
    {
        return [
            self::Ethereum->value,
            self::Polygon->value,
        ];
    }
}
