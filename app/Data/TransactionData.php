<?php

declare(strict_types=1);

namespace App\Data;

use App\Transformers\CarbonUnixTransformer;
use Carbon\Carbon;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class TransactionData extends Data
{
    public function __construct(
        public string $hash,
        public bool $isSent,
        public bool $isErrored,
        public bool $isPending,
        #[WithTransformer(CarbonUnixTransformer::class)]
        #[LiteralTypeScriptType('number')]
        public Carbon $timestamp,
        public string $amount,
        public string $fee,
        public string $from,
        public string $to,
        public string $gasPrice,
        public string $gasUsed,
        public string $nonce,
    ) {
    }
}
