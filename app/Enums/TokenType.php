<?php

declare(strict_types=1);

namespace App\Enums;

enum TokenType: string
{
    case Erc20 = 'ERC20';
    case Erc721 = 'ERC721';
    case Erc1155 = 'ERC1155';
    case Unknown = 'UNKNOWN';

    public static function compare(TokenType $type, string $value): bool
    {
        return strcasecmp($type->value, $value) == 0;
    }
}
