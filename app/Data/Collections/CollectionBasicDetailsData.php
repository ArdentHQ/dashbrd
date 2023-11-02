<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Models\Collection;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CollectionBasicDetailsData extends Data
{
    public function __construct(
        public string $slug,
        #[LiteralTypeScriptType('App.Enums.Chain')]
        public int $chainId,
    ) {
    }

    public static function fromModel(Collection $collection): self
    {
        return new self(
            slug: $collection->slug,
            chainId: $collection->network->chain_id,
        );
    }
}
