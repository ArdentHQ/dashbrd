<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Models\Collection;
use App\Transformers\IpfsGatewayUrlTransformer;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class VotableCollectionData extends Data
{
    public function __construct(
        public int $id,
        public int $index,
        public string $name,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
        public ?string $volume,
        public ?int $votes,
    ) {
    }

    public static function fromModel(Collection $collection, bool $showVotes): self
    {

        return new self(
            id: $collection->id,
            // @TODO
            index: 0,
            name: $collection->name,
            image: $collection->extra_attributes->get('image'),
            volume: $collection->volume,
            votes: $showVotes ? $collection->votes()->inCurrentMonth()->count() : null,
        );
    }
}
