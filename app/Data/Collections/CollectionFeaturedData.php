<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Data\Gallery\GalleryNftData;
use App\Data\VolumeData;
use App\Enums\CurrencyCode;
use App\Models\Collection;
use App\Transformers\IpfsGatewayUrlTransformer;
use Illuminate\Support\Str;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelMarkdown\MarkdownRenderer;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CollectionFeaturedData extends Data
{
    /**
     * @param  DataCollection<int, GalleryNftData>  $nfts
     */
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public string $address,
        #[LiteralTypeScriptType('App.Enums.Chain')]
        public int $chainId,
        public ?string $floorPrice,
        public ?float $floorPriceFiat,
        public ?string $floorPriceCurrency,
        public ?int $floorPriceDecimals,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
        public ?string $banner,
        public ?string $openSeaSlug,
        public string $website,
        public ?int $supply,
        #[DataCollectionOf(GalleryNftData::class)]
        public DataCollection $nfts,
        public bool $isFeatured,
        public ?string $description,
        public VolumeData $volume,
    ) {
    }

    public static function fromModel(Collection $collection, CurrencyCode $currency): self
    {
        $description = $collection->description === null
                    ? null
                    : html_entity_decode(strip_tags(app(MarkdownRenderer::class)->toHtml($collection->description)));

        return new self(
            id: $collection->id,
            name: $collection->name,
            slug: $collection->slug,
            address: $collection->address,
            chainId: $collection->network->chain_id,
            floorPrice: $collection->floor_price,
            floorPriceFiat: (float) $collection->fiatValue($currency),
            floorPriceCurrency: $collection->floorPriceToken ? Str::lower($collection->floorPriceToken->symbol) : null,
            floorPriceDecimals: $collection->floorPriceToken?->decimals,
            image: $collection->extra_attributes->get('image'),
            banner: $collection->extra_attributes->get('banner'),
            openSeaSlug: $collection->extra_attributes->get('opensea_slug'),
            website: $collection->website(),
            nfts: GalleryNftData::collection($collection->nfts),
            supply: $collection->supply,
            isFeatured: $collection->is_featured,
            description: $description,
            volume: $collection->createVolumeData(period: null, currency: $currency),
        );
    }
}
