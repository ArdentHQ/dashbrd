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
        public string $name,
        public string $slug,
        #[LiteralTypeScriptType('App.Enums.Chain')]
        public int $chainId,
        public ?string $floorPrice,
        public ?string $floorPriceCurrency,
        public ?int $floorPriceDecimals,
        public ?string $volume,
        public ?float $volumeFiat,
        public ?string $volumeCurrency,
        public ?int $volumeDecimals,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
    ) {
    }

    public static function fromModel(Collection $collection, CurrencyCode $currency): self
    {
        /** @var mixed $collection (volume_fiat is add with the `scopeSelectVolumeFiat`) */
        return new self(
            id: $collection->id,
            name: $collection->name,
            slug: $collection->slug,
            chainId: $collection->network->chain_id,
            floorPrice: $collection->floor_price,
            floorPriceCurrency: $collection->floorPriceToken ? Str::lower($collection->floorPriceToken->symbol) : null,
            floorPriceDecimals: $collection->floorPriceToken?->decimals,
            volume: $collection->volume,
            volumeFiat: (float) $collection->volume_fiat,
            // Volume is normalized to `ETH`
            volumeCurrency: 'ETH',
            volumeDecimals: 18,
            image: $collection->extra_attributes->get('image'),
        );
    }
}
