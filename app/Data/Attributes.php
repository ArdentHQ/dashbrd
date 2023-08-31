<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class Attributes extends Data
{
    /**
     * @var string
     */
    const BASE_CURRENCY = 'USD';

    public function __construct(
        public string $currency,
        public string $date_format,
        #[LiteralTypeScriptType('"12"|"24"')]
        public string $time_format,
        public string $timezone,
    ) {
    }
}
