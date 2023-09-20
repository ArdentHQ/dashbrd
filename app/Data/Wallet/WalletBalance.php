<?php

declare(strict_types=1);

namespace App\Data\Wallet;

use Spatie\LaravelData\Data;

class WalletBalance extends Data
{
    public function __construct(
        public string $address,
        public string $balance,
        public string $formattedBalance
    ) {
    }
}
