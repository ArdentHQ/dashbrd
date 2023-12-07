<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Enums\CurrencyCode;
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
        public int $id,
        public int $rank,
        public string $name,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
        public ?string $volume,
        public int $votes,
        public ?float $volumeFiat,
        public ?string $volumeCurrency,
        public ?int $volumeDecimals,
        public ?string $floorPrice,
        public ?float $floorPriceFiat,
        public ?string $floorPriceCurrency,
        public ?int $floorPriceDecimals,
        public int $nftsCount,
    ) {
    }

    public static function fromModel(Collection $collection, CurrencyCode $currency): self
    {
        /**
         * @var mixed $collection
         */
        return new self(
            id: $collection->id,
            rank: $collection->rank ?? 1,
            name: $collection->name,
            image: $collection->extra_attributes->get('image'),
            floorPrice: $collection->floor_price,
            floorPriceFiat: (float) $collection->fiatValue($currency),
            floorPriceCurrency: $collection->floorPriceToken ? Str::lower($collection->floorPriceToken->symbol) : null,
            floorPriceDecimals: $collection->floorPriceToken?->decimals,
            volume: $collection->volume,
            volumeFiat: 35380.4,
            volumeCurrency: 'eth',
            volumeDecimals: 18,
            votes: $collection->votes_count ?? 0,
            nftsCount: $collection->nfts_count,
        );
    }
}
