<?php

declare(strict_types=1);

namespace App\Enums;

enum TokenGuid: string
{
    case Ethereum = 'ethereum';
    case Polygon = 'matic-network';
}
