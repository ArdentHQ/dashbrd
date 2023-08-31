<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum Platforms: string
{
    case Ethereum = 'ethereum';
    case Polygon = 'polygon-pos';

    /**
     * @return string[]
     */
    public static function platforms(): array
    {
        return [
            self::Ethereum->value,
            self::Polygon->value,
        ];
    }
}
