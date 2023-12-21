<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Models\CollectionWinner;
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
        public ?string $volume,
        public ?string $floorPrice,
        public ?string $floorPriceCurrency,
        public ?int $floorPriceDecimals,
        public ?string $name,
        public string $slug,
    ) {
    }

    public static function fromModel(CollectionWinner $winner): self
    {
        return new self(
            image: $winner->collection->extra_attributes->get('image'),
            votes: $winner->votes,
            volume: $winner->collection->volume,
            floorPrice: $winner->collection->floor_price,
            floorPriceCurrency: $winner->collection->floorPriceToken?->symbol,
            floorPriceDecimals: $winner->collection->floorPriceToken?->decimals,
            name: $winner->collection->name,
            slug: $winner->collection->slug,
        );
    }
}
