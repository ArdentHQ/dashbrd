<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum TokenGuid: string
{
    case Ethereum = 'ethereum';
    case Polygon = 'matic-network';
}
