<?php

declare(strict_types=1);

it('returns the content of the sql file', function () {
    $contents = get_query('gallery.calculate_score');

    expect($contents)->toContain('SELECT');
});

it('throws an exception if file does not exist', function () {
    get_query('typo.in.the.name');
})->throws(Exception::class);

it('can compile blade template', function () {
    $contents = get_query('test', [
        'id' => 'test',
    ]);

    expect($contents)->toBe("select * from users where id = 'test'".PHP_EOL);
});

it('should detect if the given string is base64 encoded', function () {
    expect(isBase64EncodedImage('data:image/png;base64,iVBhEUgAAAREDACTED'))->toBeTrue()
        ->and(isBase64EncodedImage('https://cats.com/'))->toBeFalse();
});

it('format_amount_for_display', function ($amount, $expected) {
    expect(format_amount_for_display($amount))->toEqual($expected);
})->with([
    [6_543, '6.5k'],
    [12_320_000, '12.3m'],
    [1, '1'],
    [2, '2'],
    [124, '124'],
    [1232, '1.2k'],
    [2_540_123, '2.5m'],
]);

it('should filter attributes', function () {
    $requiredAttributes = [
        'description',
        'contract' => [
            'address',
        ],
        'contractMetadata' => [
            'symbol',
            'name',
            'totalSupply',
            'openSea' => ['twitterUsername', 'discordUrl', 'floorPrice', 'collectionName', 'imageUrl', 'externalUrl', 'description'],
            'deployedBlockNumber',
        ],
    ];

    $data = [
        'contract' => [
            'address' => '0x4e1f41613c9084fdb9e34e11fae9412427480e56',
        ],
        'id' => [
            'tokenId' => '0x0000000000000000000000000000000000000000000000000000000000000001',
            'tokenMetadata' => [
                'tokenType' => 'ERC721',
            ],
        ],
        'title' => 'Level 13 at {9, 5}',
        'description' => 'Terraforms by Mathcastles. Onchain land art from a dynamically generated, onchain 3D world.',
        'tokenUri' => [
            'gateway' => '',
            'raw' => 'data:',
        ],
        'media' => [
            [
                'gateway' => 'https://nft-cdn.alchemy.com/eth-mainnet/b5a0b09ef853edc679205cf0062b331f',
                'thumbnail' => 'https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/eth-mainnet/b5a0b09ef853edc679205cf0062b331f',
                'raw' => 'data:',
                'format' => 'svg+xml',
                'bytes' => 44846,
            ],
        ],
        'timeLastUpdated' => '2023-08-13T15:31:14.203Z',
        'contractMetadata' => [
            'name' => 'Terraforms',
            'symbol' => 'TERRAFORMS',
            'totalSupply' => '9910',
            'tokenType' => 'ERC721',
            'contractDeployer' => '0x9f400619b85eaca2f1f76f4f7e44ab7e5ee12cfa',
            'deployedBlockNumber' => 13823015,
            'openSea' => [
                'floorPrice' => 1.618999,
                'collectionName' => 'Terraforms by Mathcastles',
                'collectionSlug' => 'terraforms',
                'safelistRequestStatus' => 'approved',
                'imageUrl' => 'https://i.seadn.io/gcs/files/8987b795655076fdf8183a7daee3754a.gif?w=500&auto=format',
                'description' => 'Onchain land art from a dynamically generated onchain 3D world.',
                'externalUrl' => 'http://mathcastles.xyz',
                'twitterUsername' => 'mathcastles',
                'discordUrl' => 'https://discord.gg/mathcastles',
                'lastIngestedAt' => '2023-08-15T10:54:18.000Z',
            ],
        ],
    ];

    expect(filterAttributes($data, $requiredAttributes))->toEqual($array = [
        'contract' => [
            'address' => '0x4e1f41613c9084fdb9e34e11fae9412427480e56',
        ],
        'description' => 'Terraforms by Mathcastles. Onchain land art from a dynamically generated, onchain 3D world.',
        'contractMetadata' => [
            'name' => 'Terraforms',
            'symbol' => 'TERRAFORMS',
            'totalSupply' => '9910',
            'deployedBlockNumber' => 13823015,
            'openSea' => [
                'floorPrice' => 1.618999,
                'collectionName' => 'Terraforms by Mathcastles',
                'imageUrl' => 'https://i.seadn.io/gcs/files/8987b795655076fdf8183a7daee3754a.gif?w=500&auto=format',
                'description' => 'Onchain land art from a dynamically generated onchain 3D world.',
                'externalUrl' => 'http://mathcastles.xyz',
                'twitterUsername' => 'mathcastles',
                'discordUrl' => 'https://discord.gg/mathcastles',
            ],
        ],
    ]);
});
