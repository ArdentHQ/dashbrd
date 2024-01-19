<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Models\Collection;
use App\Transformers\IpfsGatewayUrlTransformer;
use Illuminate\Support\Str;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class PopularCollectionData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        #[LiteralTypeScriptType('App.Enums.Chain')]
        public int $chainId,
        public ?string $floorPrice,
        public ?string $floorPriceCurrency,
        public ?int $floorPriceDecimals,
        public ?float $floorPriceChange,
        public ?string $volume,
        public ?float $volumeFiat,
        public ?string $volumeCurrency,
        public ?int $volumeDecimals,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
    ) {
    }

    public static function fromModel(Collection $collection, CurrencyCode $currency, Period $volumePeriod): self
    {
        $volume = $collection->getVolume($volumePeriod);

        /** @var mixed $collection (`price_change_24h` is added with the `scopeAddFloorPriceChange`) */
        return new self(
            id: $collection->id,
            name: $collection->name,
            slug: $collection->slug,
            chainId: $collection->network->chain_id,
            floorPrice: $collection->floor_price,
            floorPriceCurrency: $collection->floorPriceToken ? Str::lower($collection->floorPriceToken->symbol) : null,
            floorPriceDecimals: $collection->floorPriceToken?->decimals,
            floorPriceChange: $collection->price_change_24h !== null ? (float) $collection->price_change_24h : null,
            volume: $volume,
            volumeFiat: $collection->nativeToken()->toCurrentFiat($volume, $currency)?->toFloat(),
            volumeCurrency: $collection->nativeToken()->symbol,
            volumeDecimals: $collection->nativeToken()->decimals,
            image: $collection->extra_attributes->get('image'),
        );
    }
}
