<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum NftTransferType: string
{
    case Mint = 'LABEL_MINT';
    case Sale = 'LABEL_SALE';
    case Transfer = 'LABEL_TRANSFER';
    case Burn = 'LABEL_BURN';
}
