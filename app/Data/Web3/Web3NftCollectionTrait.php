<?php

declare(strict_types=1);

namespace App\Data\Web3;

use App\Enums\TraitDisplayType;
use Spatie\LaravelData\Data;

class Web3NftCollectionTrait extends Data
{
    public function __construct(
        public string $name,
        public string $value,
        public ?float $valueMin,
        public ?float $valueMax,
        public string $nftsCount,
        public float $nftsPercentage,
        public TraitDisplayType $displayType,
    ) {
    }
}
