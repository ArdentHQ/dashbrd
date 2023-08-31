<?php

declare(strict_types=1);

namespace App\Data\Token;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[LiteralTypeScriptType('Partial<Record<string, Partial<Record<string, CurrencyPriceData>>>>')]
class TokenPriceLookupData extends Data
{
}
