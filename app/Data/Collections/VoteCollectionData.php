<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Models\Collection;
use App\Transformers\IpfsGatewayUrlTransformer;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class VoteCollectionData extends Data
{
    public function __construct(
        public int $id,
        public int $index,
        public string $name,
        public ?string $volume,
        public ?string $volumeCurrency,
        public ?int $volumeDecimals,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
        public ?int $votes
    ) {
    }

    public static function fromModel(Collection $collection, int $index): self
    {
        return new self(
            id: $collection->id,
            index: $index,
            name: $collection->name,
            volume: $collection->volume,
            volumeCurrency: 'eth',
            volumeDecimals: 18,
            image: $collection->extra_attributes->get('image'),
            votes: $collection->vote_count,
        );
    }
}
