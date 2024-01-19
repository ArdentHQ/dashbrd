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

    public static function fromModel(Collection $collection, CurrencyCode $currency, bool $showVotes, bool $alreadyWon = false): self
    {
        // For votable collections, we only care about the volume in the last 30 days...
        $volume = $collection->getVolume(Period::MONTH);
        $token = $collection->nativeToken();

        return new self(
            id: $collection->id,
            rank: $collection->monthly_rank,
            name: $collection->name,
            address: $collection->address,
            image: $collection->extra_attributes->get('image'),
            votes: $showVotes ? $collection->monthly_votes : null,
            floorPrice: $collection->floor_price,
            floorPriceFiat: (float) $collection->fiatValue($currency),
            floorPriceCurrency: $collection->floor_price_symbol,
            floorPriceDecimals: $collection->floor_price_decimals,
            floorPriceChange: $collection->price_change_24h !== null ? (float) $collection->price_change_24h : null,
            volume: new VolumeData(
                value: $volume,
                fiat: $token->toCurrentFiat($volume, $currency)?->toFloat(),
                currency: $token->symbol,
                decimals: $token->decimals,
            ),
            nftsCount: $collection->nfts_count,
            // We are not using the `->twitter` method because we need the username
            // not the twitter url
            twitterUsername: $collection->extra_attributes->get('socials.twitter'),
            alreadyWon: $alreadyWon,
        );
    }
}
