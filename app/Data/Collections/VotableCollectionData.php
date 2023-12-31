<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Enums\CurrencyCode;
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
        public ?string $volume,
        public ?float $volumeFiat,
        public string $volumeCurrency,
        public int $volumeDecimals,
        public int $nftsCount,
        public ?string $twitterUsername,
    ) {
    }

    public static function fromModel(Collection $collection, CurrencyCode $currency, bool $showVotes): self
    {
        /**
         * @var mixed $collection
         */
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
            volume: $collection->volume,
            volumeFiat: (float) $collection->volume_fiat,
            // Volume is normalized to `ETH`
            volumeCurrency: 'ETH',
            volumeDecimals: 18,
            nftsCount: $collection->nfts_count,
            // We are not using the `->twitter` method because we need the username
            // not the twitter url
            twitterUsername: $collection->extra_attributes->get('socials.twitter')
        );
    }
}
