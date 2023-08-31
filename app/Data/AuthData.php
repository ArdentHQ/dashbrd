<?php

declare(strict_types=1);

namespace App\Data;

use App\Data\Wallet\WalletData;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class AuthData extends Data
{
    public function __construct(
        public ?UserData $user,
        public ?WalletData $wallet,
        public bool $authenticated,
    ) {
    }
}
