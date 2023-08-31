<?php

declare(strict_types=1);

namespace App\Data\Wallet;

use App\Models\Wallet;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class WalletAvatarData extends Data
{
    public function __construct(
        public ?string $default,
        public ?string $small,
        public ?string $small2x,
    ) {
    }

    public static function fromModel(Wallet $wallet): self
    {
        $details = $wallet->details;

        $default = ($avatar = $details?->getFirstMediaUrl('avatar')) ? $avatar : null;
        $small = ($avatar = $details?->getFirstMediaUrl('avatar', 'small')) ? $avatar : null;
        $small2x = ($avatar = $details?->getFirstMediaUrl('avatar', 'small2x')) ? $avatar : null;

        return new self(
            default: $default,
            small: $small,
            small2x: $small2x,
        );
    }
}
