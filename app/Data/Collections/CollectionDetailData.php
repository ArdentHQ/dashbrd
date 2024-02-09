<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Data\Token\TokenData;
use App\Enums\CurrencyCode;
use App\Models\Collection;
use App\Models\User;
use App\Transformers\IpfsGatewayUrlTransformer;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CollectionDetailData extends Data
{
    public function __construct(
        public string $name,
        public string $slug,
        public ?string $description,
        public string $address,
        #[LiteralTypeScriptType('App.Enums.Chain')]
        public int $chainId,
        public ?string $floorPrice,
        public ?string $floorPriceCurrency,
        public ?int $floorPriceDecimals,
        public ?float $floorPriceFiat,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
        public ?string $banner,
        public ?string $bannerUpdatedAt,
        public ?string $openSeaSlug,
        public ?string $website,
        public ?string $twitter,
        public ?string $discord,
        public ?int $supply,
        public ?string $volume,
        public ?int $owners,
        public int $nftsCount,
        public ?int $mintedAt,
        public ?Carbon $activityUpdatedAt,
        public ?Carbon $activityUpdateRequestedAt,
        public ?bool $isFetchingActivity,
        public TokenData $token,
    ) {
    }

    public static function fromModel(Collection $collection, ?CurrencyCode $currencyCode = null, ?User $user = null): self
    {
        $symbol = $collection->floorPriceToken?->symbol;

        return new self(
            name: $collection->name,
            slug: $collection->slug,
            description: $collection->description,
            address: $collection->address,
            chainId: $collection->network->chain_id,
            floorPrice: $collection->floor_price,
            floorPriceCurrency: $symbol ? Str::lower($symbol) : null,
            floorPriceDecimals: $collection->floorPriceToken?->decimals,
            floorPriceFiat: $currencyCode !== null ? $collection->fiatValue($currencyCode) : null,
            image: $collection->extra_attributes->get('image'),
            banner: $collection->extra_attributes->get('banner'),
            bannerUpdatedAt: $collection->extra_attributes->get('banner_updated_at'),
            openSeaSlug: $collection->extra_attributes->get('opensea_slug'),
            website: $collection->website(defaultToExplorer: false),
            twitter: $collection->twitter(),
            discord: $collection->discord(),
            supply: $collection->supply,
            volume: $collection->total_volume,
            owners: $collection->owners,
            nftsCount: $collection->nfts()->when($user !== null, fn ($q) => $q->ownedBy($user))->count(),
            mintedAt: $collection->minted_at?->getTimestampMs(),
            activityUpdatedAt: $collection->activity_updated_at,
            activityUpdateRequestedAt: $collection->activity_update_requested_at,
            isFetchingActivity: $collection->is_fetching_activity,
            token: TokenData::fromModel($collection->nativeToken()),
        );
    }
}
