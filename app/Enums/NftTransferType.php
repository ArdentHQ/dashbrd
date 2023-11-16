<?php

declare(strict_types=1);

namespace App\Enums;

use InvalidArgumentException;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

/**
 * @see https://docs.mnemonichq.com/references/uniform/rest/reference/#operation/FoundationalService_GetNftTransfers
 */
#[TypeScript]
enum NftTransferType: string
{
    case Mint = 'LABEL_MINT';
    case Sale = 'LABEL_SALE';
    case Transfer = 'LABEL_TRANSFER';
    case Burn = 'LABEL_BURN';

    public static function getEnumFromValue(string $value): self
    {
        return match ($value) {
            'LABEL_MINT' => self::Mint,
            'LABEL_SALE' => self::Sale,
            'LABEL_TRANSFER' => self::Transfer,
            'LABEL_BURN' => self::Burn,
            default => throw new InvalidArgumentException(sprintf('Invalid value: %s', $value)),
        };
    }
}
