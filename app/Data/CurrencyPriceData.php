<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CurrencyPriceData extends Data
{
    public function __construct(
        public float $price,
        public float $percentChange24h,
    ) {
    }
}
