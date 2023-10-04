<?php

declare(strict_types=1);

namespace App\Data\Gallery;

use App\Data\ImagesData;
use App\Models\Collection;
use App\Models\Nft;
use DateTime;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class GalleryNftData extends Data
{
    public function __construct(
        public int $id,
        public ?string $name,
        public string $tokenNumber,
        public string $tokenAddress,
        public int $chainId,
        public ImagesData $images,
        public string $collectionName,
        public string $collectionSlug,
        public int $collectionNftCount,
        public string $collectionWebsite,
        public ?string $collectionImage,
        public ?string $floorPrice,
        public ?string $floorPriceCurrency,
        public ?int $floorPriceDecimals,
        public ?DateTime $lastActivityFetchedAt,
        public ?DateTime $lastViewedAt,
        public bool $ownedByCurrentUser = false,
    ) {
    }

    public static function fromModel(Nft $nft, bool $ownedByCurrentUser = false): self
    {
        /** @var Collection $collection */
        $collection = $nft->collection;

        return new self(
            id: $nft->id,
            name: $nft->name,
            tokenNumber: $nft->token_number,
            tokenAddress: $collection->address,
            chainId: $collection->network->chain_id,
            images: ImagesData::from($nft->images()),
            collectionName: $collection->name,
            collectionSlug: $collection->slug,
            collectionNftCount: $collection->nfts_count ?? 0,
            collectionWebsite: $collection->website(),
            collectionImage: $collection->extra_attributes->get('image'),
            floorPrice: $collection->floor_price,
            floorPriceCurrency: $collection->floorPriceToken?->symbol,
            floorPriceDecimals: $collection->floorPriceToken?->decimals,
            lastActivityFetchedAt: $nft->last_activity_fetched_at,
            lastViewedAt: $nft->last_viewed_at,
            ownedByCurrentUser: $ownedByCurrentUser,
        );
    }
}
