<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Data\VolumeData;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Models\Collection;
use App\Transformers\IpfsGatewayUrlTransformer;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class VotableCollectionData extends Data
{
    public function __construct(
        public int $id,
        public ?int $rank,
        public string $name,
        public string $address,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
        public ?int $votes,
        public ?string $floorPrice,
        public ?float $floorPriceFiat,
        public ?string $floorPriceCurrency,
        public ?int $floorPriceDecimals,
        public ?float $floorPriceChange,
        public VolumeData $volume,
        public int $nftsCount,
        public ?string $twitterUsername,
        public bool $alreadyWon,
    ) {
    }

    public static function fromModel(Collection $collection, CurrencyCode $currency, bool $showVotes, bool $alreadyWon = false, ?int $rank = null): self
    {
        /** @var mixed $collection */
        return new self(
            id: $collection->id,
            rank: $rank,
            name: $collection->name,
            address: $collection->address,
            image: $collection->extra_attributes->get('image'),
            votes: $showVotes ? $collection->votes_count : null,
            floorPrice: $collection->floor_price,
            floorPriceFiat: (float) $collection->fiatValue($currency),
            floorPriceCurrency: $collection->floorPriceToken?->symbol,
            floorPriceDecimals: $collection->floorPriceToken?->decimals,
            floorPriceChange: $collection->relationLoaded('floorPriceHistory') ? $collection->floorPriceChange() : null,
            volume: $collection->createVolumeData(Period::MONTH, $currency), // For votable collections, we only care about the volume in the last 30 days...
            nftsCount: $collection->nfts_count,
            // We are not using the `->twitter` method because we need the username
            // not the twitter url
            twitterUsername: $collection->extra_attributes->get('socials.twitter'),
            alreadyWon: $alreadyWon,
        );
    }
}
