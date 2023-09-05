<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Data\Collections\Concerns\QueriesCollectionNfts;
use App\Models\Collection;
use App\Transformers\IpfsGatewayUrlTransformer;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CollectionData extends Data
{
    use QueriesCollectionNfts;

    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public string $address,
        #[LiteralTypeScriptType('App.Enums.Chains')]
        public int $chainId,
        public ?string $floorPrice,
        public ?float $floorPriceFiat,
        public ?string $floorPriceCurrency,
        public ?int $floorPriceDecimals,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
        public ?string $banner,
        public ?string $website,
        public int $nftsCount,
    ) {
    }

    /**
     * Note: the collection model does not have all those attributes, this
     * method is mean to be used within the `Collection@scopeForCollectionData`
     * scope.
     */
    public static function fromModel(Collection $collection): self
    {
        /**
         * @var  object{
         * id: int,
         * name: string,
         * slug: string,
         * address: string,
         * chain_id: int,
         * floor_price: string | null,
         * floor_price_fiat: string | null,
         * floor_price_currency: string | null,
         * floor_price_decimals: int | null,
         * image: string | null,
         * banner: string | null,
         * website: string,
         * nfts_count: int,
         * } $collection
         */
        return new self(
            id: $collection->id,
            name: $collection->name,
            slug: $collection->slug,
            address: $collection->address,
            chainId: $collection->chain_id,
            floorPrice: $collection->floor_price,
            floorPriceFiat: floatval($collection->floor_price_fiat),
            floorPriceCurrency: $collection->floor_price_currency,
            floorPriceDecimals: $collection->floor_price_decimals,
            image: $collection->image,
            banner: $collection->banner,
            website: $collection->website,
            nftsCount: $collection->nfts_count,
        );
    }
}
