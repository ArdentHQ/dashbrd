<?php

declare(strict_types=1);

namespace App\Data\Web3;

readonly class Web3ContractMetadata
{
    public function __construct(
        public string $contractAddress,
        public ?string $collectionName,
        public ?int $totalSupply,
        public ?int $mintedBlock,
        public ?string $collectionSlug,
        public ?string $imageUrl,
        public ?float $floorPrice,
        public ?string $bannerImageUrl,
        public ?string $description,
    ) {
    }
}
