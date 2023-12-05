<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Models\Collection;
use App\Transformers\IpfsGatewayUrlTransformer;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CollectionOfTheMonthData extends Data
{
    public function __construct(
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
        public int $votes,

    ) {
    }

    public static function fromModel(Collection $collection): self
    {
        return new self(
            image: $collection->extra_attributes->get('image'),
            votes: $collection->votes()->inCurrentMonth()->count(),
        );
    }
}
