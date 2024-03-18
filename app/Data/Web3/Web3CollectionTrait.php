<?php

declare(strict_types=1);

namespace App\Data\Web3;

use App\Enums\TraitDisplayType;

class Web3CollectionTrait
{
    public function __construct(
        public string $name,
        public string $value,
        public ?float $valueMin,
        public ?float $valueMax,
        public float $nftsPercentage,
        public TraitDisplayType $displayType,
    ) {
    }
}
