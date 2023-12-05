<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Enums\CurrencyCode;
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
        public string $address,
        public string $name,
        public string $slug,
        #[LiteralTypeScriptType('App.Enums.Chain')]
        public int $chainId,
        public ?string $floorPrice,
        public ?string $floorPriceCurrency,
        public ?int $floorPriceDecimals,
        public ?float $floorPriceFiat,
        public ?string $volume,
        public ?float $volumeFiat,
        public ?string $volumeCurrency,
        public ?int $volumeDecimals,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
        public int $nftsCount,
    ) {
    }

    public static function fromModel(Collection $collection, CurrencyCode $currency): self
    {
        return new self(
            id: $collection->id,
            name: $collection->name,
            address: $collection->address,
            slug: $collection->slug,
            chainId: $collection->network->chain_id,
            floorPrice: $collection->floor_price,
            floorPriceCurrency: $collection->floorPriceToken ? Str::lower($collection->floorPriceToken->symbol) : null,
            floorPriceDecimals: $collection->floorPriceToken?->decimals,
            floorPriceFiat: (float) $collection->fiatValue($currency),
            // @TODO: makey this dynamic
            volume: '19000000000000000000',
            volumeFiat: 35380.4,
            volumeCurrency: 'eth',
            volumeDecimals: 18,
            image: $collection->extra_attributes->get('image'),
            nftsCount: $collection->nfts_count,
        );
    }
}
