<?php

declare(strict_types=1);

namespace App\Data\Web3;

use App\Enums\TraitDisplayType;
use App\Models\Token;
use Carbon\Carbon;

class Web3NftData
{
    /**
     * @param  array{images: array{thumb: string | null, small: string | null, large: string | null, originalRaw: string | null, original: string | null}}  $extraAttributes
     * @param  array<array{name: string, value: string, displayType: TraitDisplayType}>  $traits
     * @param  null|array{twitter: string, discord: string}  $collectionSocials
     */
    public function __construct(
        public string $tokenAddress,
        public string $tokenNumber,
        public int $networkId,
        public string $collectionName,
        public string $collectionSymbol,
        public ?string $collectionImage,
        public ?string $collectionWebsite,
        public ?string $collectionDescription,
        public ?string $collectionBannerImageUrl,
        public ?Carbon $collectionBannerUpdatedAt,
        public ?string $collectionOpenSeaSlug,
        public ?array $collectionSocials,
        public ?int $collectionSupply,
        public ?string $name,
        public ?string $description,
        public array $extraAttributes,
        public ?Web3NftCollectionFloorPrice $floorPrice,
        public array $traits,
        public int $mintedBlock,
        public ?Carbon $mintedAt,
        public ?bool $hasError,
        public ?string $info,
    ) {
    }

    public function token(): ?Token
    {
        if ($this->floorPrice === null) {
            return null;
        }

        return Token::firstWhere([
            'symbol' => $this->floorPrice->currency,
            'network_id' => $this->networkId,
        ]);
    }
}
