<?php

declare(strict_types=1);

use App\Jobs\LiveDumpTokenData;
use Illuminate\Support\Facades\Storage;

it('should store token details in a json file', function () {
    Storage::fake('live-dump');

    $data = [
        [
            'guid' => 'matic-network',
            'name' => 'Polygon',
            'symbol' => 'matic',
            'address' => '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
            'network_id' => 3,
            'decimals' => 18,
            'extra_attributes' => [
                'images' => [
                    'thumb' => 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912',
                    'small' => 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912',
                    'large' => 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
                ],
                'socials' => [
                    'website' => 'https://polygon.technology/',
                    'twitter' => '0xPolygon',
                    'discord' => 'https://discord.com/invite/XvpHAxZ',
                ],
            ],
        ],
        [
            'guid' => 'matic-network',
            'name' => 'Polygon',
            'symbol' => 'matic',
            'address' => '0x0000000000000000000000000000000000001010',
            'network_id' => 1,
            'decimals' => 18,
            'extra_attributes' => [
                'images' => [
                    'thumb' => 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912',
                    'small' => 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912',
                    'large' => 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
                ],
                'socials' => [
                    'website' => 'https://polygon.technology/',
                    'twitter' => '0xPolygon',
                    'discord' => 'https://discord.com/invite/XvpHAxZ',
                ],
            ],
        ],
    ];

    LiveDumpTokenData::dispatch($data);

    Storage::disk('live-dump')->assertExists('tokens.json');

    $content = Storage::disk('live-dump')->get('tokens.json');

    expect(json_decode($content, true))->toBe($data);
});

it('should add more token details and update by address, network', function () {
    Storage::fake('live-dump');

    $data = [
        [
            'guid' => 'matic-network',
            'name' => 'Polygon',
            'symbol' => 'matic',
            'address' => '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
            'network_id' => 3,
            'decimals' => 18,
            'extra_attributes' => [
                'images' => [
                    'thumb' => 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912',
                    'small' => 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912',
                    'large' => 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
                ],
                'socials' => [
                    'website' => 'https://polygon.technology/',
                    'twitter' => '0xPolygon',
                    'discord' => 'https://discord.com/invite/XvpHAxZ',
                ],
            ],
        ],
        [
            'guid' => 'matic-network',
            'name' => 'Polygon',
            'symbol' => 'matic',
            'address' => '0x0000000000000000000000000000000000001010',
            'network_id' => 1,
            'decimals' => 18,
            'extra_attributes' => [
                'images' => [
                    'thumb' => 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912',
                    'small' => 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912',
                    'large' => 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
                ],
                'socials' => [
                    'website' => 'https://polygon.technology/',
                    'twitter' => '0xPolygon',
                    'discord' => 'https://discord.com/invite/XvpHAxZ',
                ],
            ],
        ],
    ];

    LiveDumpTokenData::dispatch($data);

    $data = [
        [
            'guid' => 'matic-network',
            'name' => 'Polygon',
            'symbol' => 'matic',
            'address' => '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
            'network_id' => 3,
            'decimals' => 15,
            'extra_attributes' => [
                'images' => [
                    'thumb' => 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912',
                    'small' => 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912',
                    'large' => 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
                ],
                'socials' => [
                    'website' => 'https://polygon.technology/',
                    'twitter' => '0xPolygon',
                    'discord' => 'https://discord.com/invite/XvpHAxZ',
                ],
            ],
        ],
        [
            'guid' => 'other',
            'name' => 'Other',
            'symbol' => 'other',
            'address' => '0x0000000000000000000000000000000000001011',
            'network_id' => 1,
            'decimals' => 18,
            'extra_attributes' => [
                'images' => [
                    'thumb' => 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912',
                    'small' => 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912',
                    'large' => 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
                ],
                'socials' => [
                    'website' => 'https://polygon.technology/',
                    'twitter' => '0xPolygon',
                    'discord' => 'https://discord.com/invite/XvpHAxZ',
                ],
            ],
        ],
    ];

    LiveDumpTokenData::dispatch($data);

    Storage::disk('live-dump')->assertExists('tokens.json');

    $content = Storage::disk('live-dump')->get('tokens.json');

    expect(json_decode($content, true))->toHaveCount(3);
});
