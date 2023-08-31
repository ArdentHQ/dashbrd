<?php

declare(strict_types=1);

namespace App\Data\Gallery;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class GalleryLikeData extends Data
{
    public function __construct(
        public int $likes,
        public bool $hasLiked,
    ) {
    }
}
