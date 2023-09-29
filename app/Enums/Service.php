<?php

declare(strict_types=1);

namespace App\Enums;

enum Service: string
{
    case Coingecko = 'coingecko';

    case Moralis = 'moralis';

    case Mnemonic = 'mnemonic';

    case Alchemy = 'alchemy';

    case Opensea = 'opensea';
}
