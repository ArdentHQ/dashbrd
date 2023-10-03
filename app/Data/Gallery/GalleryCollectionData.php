<?php

declare(strict_types=1);

namespace App\Data\Gallery;

use App\Enums\CurrencyCode;
use App\Models\Collection;
use App\Models\User;
use App\Transformers\IpfsGatewayUrlTransformer;
use Illuminate\Support\Str;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class GalleryCollectionData extends Data
{
    public function __construct(
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
        public ?string $bannerUpdatedAt,
        public ?string $openSeaSlug,
        public ?string $website,
        public ?int $nftsCount,
    ) {
    }

    public static function fromModel(Collection $collection, CurrencyCode $currencyCode = null, User $user = null): self
    {
        $symbol = $collection->floorPriceToken?->symbol;

        return new self(
            name: $collection->name,
            slug: $collection->slug,
            address: $collection->address,
            chainId: $collection->network->chain_id,
            floorPrice: $collection->floor_price,
            floorPriceFiat: $currencyCode !== null ? $collection->fiatValue($currencyCode) : null,
            floorPriceCurrency: $symbol ? Str::lower($symbol) : null,
            floorPriceDecimals: $collection->floorPriceToken?->decimals,
            image: $collection->extra_attributes->get('image'),
            banner: $collection->extra_attributes->get('banner'),
            bannerUpdatedAt: $collection->extra_attributes->get('banner_updated_at'),
            openSeaSlug: $collection->extra_attributes->get('opensea_slug'),
            website: $collection->website(),
            nftsCount: $collection->nfts_count ?? null,
        );
    }
}
