<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Models\Collection;
use App\Transformers\IpfsGatewayUrlTransformer;
use Illuminate\Support\Str;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class VotableCollectionData extends Data
{
    public function __construct(
        public string $name,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
        public ?string $volume,
        public ?string $volumeCurrency,
        public ?int $volumeDecimals,
        public ?int $votes,
    ) {
    }

    public static function fromModel(Collection $collection, bool $showVotes): self
    {

        return new self(
            name: $collection->name,
            image: $collection->extra_attributes->get('image'),
            volume: $collection->volume,
            // Notice that im using the floor price token here which assumes that
            // the floor price token is the same as the volume token
            volumeCurrency: $collection->floorPriceToken ? Str::lower($collection->floorPriceToken->symbol) : null,
            volumeDecimals: $collection->floorPriceToken?->decimals,
            votes: $showVotes ? $collection->votes()->inCurrentMonth()->count() : null,
        );
    }
}
