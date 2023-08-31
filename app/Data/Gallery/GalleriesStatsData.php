<?php

declare(strict_types=1);

namespace App\Data\Gallery;

use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class GalleriesStatsData extends Data
{
    public function __construct(
        public int $users,
        public int $galleries,
        public int $collections,
        public int $nfts,
    ) {
    }
}
