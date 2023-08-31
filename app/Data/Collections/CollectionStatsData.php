<?php

declare(strict_types=1);

namespace App\Data\Collections;

use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class CollectionStatsData extends Data
{
    public function __construct(
        public int $nfts,
        public int $collections,
        public ?float $value,
    ) {
    }
}
