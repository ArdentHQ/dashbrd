<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class FloorPriceData extends Data
{
    public function __construct(
        public ?string $value,
        public ?float $change,
        public ?float $fiat,
        public string $currency,
        public int $decimals,
    ) {
    }
}
