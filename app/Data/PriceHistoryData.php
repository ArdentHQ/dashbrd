<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class PriceHistoryData extends Data
{
    public function __construct(
        public int $timestamp,
        public float $price,
    ) {
    }
}
