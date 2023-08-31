<?php

declare(strict_types=1);

use App\Enums\TokenType;

it('should compare value against string', function (TokenType $tokenType, string $actual, bool $equal) {
    expect(TokenType::compare($tokenType, $actual))->toBe($equal);
})->with([
    'ERC721' => [TokenType::Erc721, 'ERC721', true],
    'erc721' => [TokenType::Erc721, 'erc721', true],
    'ErC721' => [TokenType::Erc721, 'erC721', true],

    'ERC20' => [TokenType::Erc20, 'ERC20', true],
    'ERC1155' => [TokenType::Erc1155, 'ERC1155', true],

    'Erc721!=Erc20' => [TokenType::Erc721, 'Erc20', false],
]);
