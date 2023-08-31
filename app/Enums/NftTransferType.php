<?php

declare(strict_types=1);

namespace App\Enums;

use InvalidArgumentException;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

/**
 * @see https://docs.mnemonichq.com/references/uniform/rest/reference/#operation/FoundationalService_GetNftTransfers for
 * type referecnes
 */
#[TypeScript]
enum NftTransferType: string
{
    // Note: there are more labels but currently we only care about the following
    // ones
    case Mint = 'LABEL_MINT';
    case Sale = 'LABEL_SALE';
    case Transfer = 'LABEL_TRANSFER';

    public static function getEnumFromValue(string $value): self
    {
        return match ($value) {
            'LABEL_MINT' => self::Mint,
            'LABEL_SALE' => self::Sale,
            'LABEL_TRANSFER' => self::Transfer,
            default => throw new InvalidArgumentException(sprintf('Invalid value: %s', $value)),
        };
    }
}
