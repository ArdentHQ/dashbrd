<?php

declare(strict_types=1);

namespace App\Data;

use App\Data\Wallet\WalletAvatarData;
use App\Models\Wallet;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class SimpleWalletData extends Data
{
    public function __construct(
        public string $address,
        public ?string $domain,
        public WalletAvatarData $avatar,
    ) {
    }

    public static function fromModel(Wallet $wallet): self
    {
        return new self(
            address: $wallet->address,
            domain: $wallet->details?->domain,
            avatar: WalletAvatarData::fromModel($wallet),
        );
    }
}
