<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Data\FloorPriceData;
use App\Data\VolumeData;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Models\Collection;
use App\Transformers\IpfsGatewayUrlTransformer;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CollectionData extends Data
{
    /**
     * @param  DataCollection<int, SimpleNftData>  $nfts
     */
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public string $address,
        #[LiteralTypeScriptType('App.Enums.Chain')]
        public int $chainId,
        public FloorPriceData $floorPrice,
        public ?int $supply,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
        public ?string $banner,
        public ?string $openSeaSlug,
        public string $website,
        public int $nftsCount,
        #[DataCollectionOf(SimpleNftData::class)]
        public DataCollection $nfts,
        public VolumeData $volume,
    ) {
    }

    public static function fromModel(Collection $collection, CurrencyCode $currency, ?Period $volumePeriod = null): self
    {
        $volume = $volumePeriod !== null ? $collection->createVolumeData($volumePeriod, $currency) : new VolumeData(
            value: null,
            fiat: null,
            currency: $collection->nativeToken()->symbol,
            decimals: $collection->nativeToken()->decimals,
        );

        return new self(
            id: $collection->id,
            name: $collection->name,
            slug: $collection->slug,
            address: $collection->address,
            chainId: $collection->network->chain_id,
            floorPrice: $collection->createFloorPriceData($currency),
            supply: $collection->supply,
            image: $collection->extra_attributes->get('image'),
            banner: $collection->extra_attributes->get('banner'),
            openSeaSlug: $collection->extra_attributes->get('opensea_slug'),
            website: $collection->website(),
            nftsCount: $collection->nfts_count,
            nfts: SimpleNftData::collection($collection->nfts),
            volume: $volume,
        );
    }
}
