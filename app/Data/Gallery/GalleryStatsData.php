<?php

declare(strict_types=1);

namespace App\Data\Gallery;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class GalleryStatsData extends Data
{
    public function __construct(
        public int $collections,
        public int $nfts,
        public int $likes,
    ) {
    }
}
