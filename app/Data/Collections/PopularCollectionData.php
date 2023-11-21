<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Enums\CurrencyCode;
use App\Models\Collection;
use App\Transformers\IpfsGatewayUrlTransformer;
use Illuminate\Support\Str;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class PopularCollectionData extends Data
{
    /**
     * @param  DataCollection<int, SimpleNftData>  $nfts
     */
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        #[LiteralTypeScriptType('App.Enums.Chain')]
        public int $chainId,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $floorPrice,
        public ?float $floorPriceFiat,
        public ?string $floorPriceCurrency,
        public ?int $floorPriceDecimals,
        public ?string $image,
    ) {
    }

    public static function fromModel(Collection $collection, CurrencyCode $currency): self
    {
        return new self(
            id: $collection->id,
            name: $collection->name,
            slug: $collection->slug,
            chainId: $collection->network->chain_id,
            floorPrice: $collection->floor_price,
            floorPriceFiat: (float) $collection->fiatValue($currency),
            floorPriceCurrency: $collection->floorPriceToken ? Str::lower($collection->floorPriceToken->symbol) : null,
            floorPriceDecimals: $collection->floorPriceToken?->decimals,
            image: $collection->extra_attributes->get('image'),
        );
    }
}
