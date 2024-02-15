<?php

declare(strict_types=1);

namespace App\Data\Web3;

use App\Enums\TokenType;
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
        public ?Web3CollectionFloorPrice $floorPrice,
        public array $traits,
        public int $mintedBlock,
        public ?Carbon $mintedAt,
        public ?bool $hasError,
        public ?string $info,
        public TokenType $type = TokenType::Unknown,
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

    /**
     * Generate NFT's meta attributes that are then serialized when persisting the NFT into the database.
     *
     * @return array<string, mixed>
     */
    public function attributes(): array
    {
        $attributes = [
            'image' => $this->collectionImage,
            'website' => $this->collectionWebsite,
            'socials' => $this->collectionSocials,
            'banner' => $this->collectionBannerImageUrl,
            'banner_updated_at' => $this->collectionBannerImageUrl ? now() : null,
        ];

        if ($this->collectionOpenSeaSlug !== null) {
            $attributes['opensea_slug'] = $this->collectionOpenSeaSlug;
        }

        if ($this->hasError) {
            $attributes = array_filter($attributes, function ($value) {
                return $value !== null;
            });
        }

        return $attributes;
    }
}
