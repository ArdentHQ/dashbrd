<?php

declare(strict_types=1);

namespace App\Data\Collections;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CollectionStatsData extends Data
{
    public function __construct(
        public int $nfts,
        public int $collections,
        public ?float $value,
    ) {
    }
}
