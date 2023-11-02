<?php

declare(strict_types=1);

namespace App\Data\Web3;

use Carbon\Carbon;

class Web3NftCollectionFloorPrice
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
