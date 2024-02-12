<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Data\FloorPriceData;
use App\Data\VolumeData;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Models\Collection;
use App\Transformers\IpfsGatewayUrlTransformer;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class PopularCollectionData extends Data
{
    public function __construct(
        public int $id,
        public string $address,
        public string $name,
        public string $slug,
        public ?int $supply,
        #[LiteralTypeScriptType('App.Enums.Chain')]
        public int $chainId,
        public FloorPriceData $floorPrice,
        public VolumeData $volume,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
    ) {
    }

    public static function fromModel(Collection $collection, CurrencyCode $currency, Period $volumePeriod): self
    {
        return new self(
            id: $collection->id,
            address: $collection->address,
            name: $collection->name,
            slug: $collection->slug,
            supply: $collection->supply,
            chainId: $collection->network->chain_id,
            floorPrice: $collection->createFloorPriceData($currency),
            volume: $collection->createVolumeData($volumePeriod, $currency),
            image: $collection->extra_attributes->get('image'),
        );
    }
}
