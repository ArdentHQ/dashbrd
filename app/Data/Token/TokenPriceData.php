<?php

declare(strict_types=1);

namespace App\Data\Token;

use App\Data\CurrencyPriceData;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class TokenPriceData extends Data
{
    /**
     * @param  array<string, CurrencyPriceData>  $price
     */
    public function __construct(
        public int $guid,
        #[LiteralTypeScriptType('Partial<Record<string, CurrencyPriceData>>')]
        public array $price,
    ) {
    }
}
