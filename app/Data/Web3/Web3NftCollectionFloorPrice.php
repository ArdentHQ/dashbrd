<?php

declare(strict_types=1);

namespace App\Data\Web3;

use Carbon\Carbon;
use Spatie\LaravelData\Data;

class Web3NftCollectionFloorPrice extends Data
{
    public function __construct(
        // WEI
        public string $price,
        // 'eth', 'usdc', etc.
        public string $currency,
        public Carbon $retrievedAt
    ) {
    }
}
