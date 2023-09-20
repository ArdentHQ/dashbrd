<?php

declare(strict_types=1);

namespace App\Data\Web3;

use Spatie\LaravelData\Data;

class Web3ContractMetadata extends Data
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
