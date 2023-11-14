<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum Chain: int
{
    case ETH = 1;
    case Goerli = 5;
    case Polygon = 137;
    case Mumbai = 80001;

    public function nativeCurrency(): string
    {
        return match ($this) {
            self::ETH, self::Goerli => 'ETH',
            self::Polygon, self::Mumbai => 'MATIC',
        };
    }
}
