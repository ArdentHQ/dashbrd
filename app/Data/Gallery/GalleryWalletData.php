<?php

declare(strict_types=1);

namespace App\Data\Gallery;

use App\Data\Wallet\WalletAvatarData;
use App\Models\Wallet;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class GalleryWalletData extends Data
{
    public function __construct(
        public string $address,
        public ?string $domain,
        public WalletAvatarData $avatar,
    ) {
    }

    public static function fromModel(Wallet $wallet): self
    {
        $domain = $wallet->details?->domain;
        $avatarData = WalletAvatarData::fromModel($wallet);

        return new self(
            $wallet['address'],
            $domain,
            $avatarData,
        );
    }
}
