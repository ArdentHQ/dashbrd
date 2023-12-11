<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Models\Collection;
use App\Transformers\IpfsGatewayUrlTransformer;
use DateTime;
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
        public ?DateTime $hasWonAt,
    ) {
    }

    public static function fromModel(Collection $collection): self
    {
        return new self(
            image: $collection->extra_attributes->get('image'),
            votes: $collection->votes()->inPreviousMonth()->count(),
            volume: $collection->volume,
            floorPrice: $collection->floor_price,
            floorPriceCurrency: $collection->floorPriceToken?->symbol,
            floorPriceDecimals: $collection->floorPriceToken?->decimals,
            name: $collection->name,
            hasWonAt: $collection->has_won_at
        );
    }
}
