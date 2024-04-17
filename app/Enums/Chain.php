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

    public function isPolygon(): bool
    {
        return $this === self::Polygon || $this === self::Mumbai;
    }

    public function nativeCurrency(): string
    {
        return match ($this) {
            self::ETH, self::Goerli => 'ETH',
            self::Polygon, self::Mumbai => 'MATIC',
        };
    }

    public function nativeCurrencyDecimals(): int
    {
        return CryptoCurrencyDecimals::forCurrency($this->nativeCurrency());
    }
}
