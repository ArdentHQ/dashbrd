<?php

declare(strict_types=1);

use App\Enums\ImageSize;
use App\Support\NftImageUrl;

it('gets url', function ($imageSize, $original, $expected) {
    $url = NftImageUrl::get($original, $imageSize);
    expect($url)->toEqual($expected);
})->with([
    'OpenSea (no change)' => [null, 'https://i.seadn.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=96&auto=format', 'https://i.seadn.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=96&auto=format'],
    'OpenSea (custom size)' => [ImageSize::Large, 'https://i.seadn.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=96&auto=format', 'https://i.seadn.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=512&auto=format'],

    'Alchemy (no change)' => [null, 'https://res.cloudinary.com/alchemyapi/image/upload/scaled/eth-mainnet/f065afd5cf799f4ab1252111f8f3d38c', 'https://res.cloudinary.com/alchemyapi/image/upload/scaled/eth-mainnet/f065afd5cf799f4ab1252111f8f3d38c'],
    'Alchemy (custom size)' => [ImageSize::Thumb, 'https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/eth-mainnet/f065afd5cf799f4ab1252111f8f3d38c', 'https://res.cloudinary.com/alchemyapi/image/upload/w_96,h_96/scaled/eth-mainnet/f065afd5cf799f4ab1252111f8f3d38c'],

    'Moralis (no change)' => [null, 'https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6/low.jpeg', 'https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6/low.jpeg'],
    'Moralis (no extension, defaults to large)' => [null, 'https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6', 'https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6/high.jpeg'],
    'Moralis (no extension, custom size)' => [ImageSize::Thumb, 'https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6', 'https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6/low.jpeg'],
    'Moralis (custom size)' => [ImageSize::Large, 'https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6/low.jpeg', 'https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6/high.jpeg'],

    'Unrecognized url 1' => [null, 'https://i.asdfg.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=96&auto=format', 'https://i.asdfg.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=96&auto=format'],
    'Unrecognized url 2' => [ImageSize::Small, 'https://i.asdfg.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=96&auto=format', 'https://i.asdfg.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=96&auto=format'],
    'Unrecognized url 3' => [null, 'a', 'a'],
    'Unrecognized url 4' => [null, '', ''],
]);

it('gets all sizes', function ($original, $expected) {
    $urls = NftImageUrl::getAllSizes($original);
    expect($urls)->toEqual($expected);
})->with([
    'OpenSea' => ['https://i.seadn.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=96&auto=format',
        [
            'thumb' => 'https://i.seadn.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=96&auto=format',
            'small' => 'https://i.seadn.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=256&auto=format',
            'large' => 'https://i.seadn.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=512&auto=format',
        ],
    ],
    'Alchemy' => ['https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/eth-mainnet/f065afd5cf799f4ab1252111f8f3d38c',
        [
            'thumb' => 'https://res.cloudinary.com/alchemyapi/image/upload/w_96,h_96/scaled/eth-mainnet/f065afd5cf799f4ab1252111f8f3d38c',
            'small' => 'https://res.cloudinary.com/alchemyapi/image/upload/w_256,h_256/scaled/eth-mainnet/f065afd5cf799f4ab1252111f8f3d38c',
            'large' => 'https://res.cloudinary.com/alchemyapi/image/upload/w_512,h_512/scaled/eth-mainnet/f065afd5cf799f4ab1252111f8f3d38c',
        ],
    ],
    'Moralis' => ['https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6/low.jpeg',
        [
            'thumb' => 'https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6/low.jpeg',
            'small' => 'https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6/medium.jpeg',
            'large' => 'https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6/high.jpeg',
        ],
    ],
    'Other' => ['https://i.asdfg.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=96&auto=format',
        [
            'thumb' => 'https://i.asdfg.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=96&auto=format',
            'small' => 'https://i.asdfg.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=96&auto=format',
            'large' => 'https://i.asdfg.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?w=96&auto=format',
        ],
    ],
]);

it('gets all sizes with null', function () {
    $urls = NftImageUrl::getAllSizes(null);
    expect($urls)->toEqual([
        'thumb' => null,
        'small' => null,
        'large' => null,
    ]);
});
