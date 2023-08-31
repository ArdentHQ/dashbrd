<?php

declare(strict_types=1);

namespace App\Data\Nfts;

use App\Models\Wallet;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class NftWalletData extends Data
{
    public function __construct(
        public string $address,
    ) {
    }

    public static function fromModel(Wallet $wallet): self
    {
        return new self(
            address: $wallet->address,
        );
    }
}
