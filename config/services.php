<?php

declare(strict_types=1);

use App\Enums\AlchemyChain;

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'marketdata' => [
        'provider' => env('MARKETDATA_PROVIDER', 'coingecko'),
    ],

    'coingecko' => [
        'key' => env('COINGECKO_API_KEY'),
        'endpoint' => env('COINGECKO_ENDPOINT', 'https://api.coingecko.com/api/v3/'),
        'http' => [
            'timeout' => env('COINGECKO_HTTP_TIMEOUT', 20),
        ],
        // @see https://www.coingecko.com/en/api/pricing
        'rate' => [
            // This rate is used in the queued jobs, consider using a lower value
            // than the limit so you leave some room for on demand requests
            'max_requests' => env('COINGECKO_MAX_REQUESTS', 5),
            'per_seconds' => env('COINGECKO_MAX_REQUESTS_SECONDS', 60), // 1 minute
        ],
    ],

    'moralis' => [
        'key' => env('MORALIS_API_KEY', null),
        'endpoint' => env('MORALIS_API_ENDPOINT', 'https://deep-index.moralis.io/api/v2/'),
    ],

    'mnemonic' => [
        'key' => env('MNEMONIC_API_KEY', null),
    ],

    'alchemy' => [
        'apps' => [
            AlchemyChain::PolygonMainnet->value => [
                'key' => env('ALCHEMY_API_KEY_POLYGON_MAINNET', null),
            ],
            AlchemyChain::PolygonTestnet->value => [
                'key' => env('ALCHEMY_API_KEY_POLYGON_TESTNET', null),
            ],
            AlchemyChain::EthereumMainnet->value => [
                'key' => env('ALCHEMY_API_KEY_ETHEREUM_MAINNET', null),
            ],
            AlchemyChain::EthereumTestnet->value => [
                'key' => env('ALCHEMY_API_KEY_ETHEREUM_TESTNET', null),
            ],
        ],
    ],

    'opensea' => [
        'key' => env('OPENSEA_API_KEY', null),

        // @see https://docs.opensea.io/v1.0/reference/api-overview#api-faqs
        'rate' => [
            // Notice that the limit for POST request is 2, but currently we only
            // use GET requests
            'max_requests' => env('OPENSEA_MAX_REQUESTS', 4),
            'per_seconds' => env('OPENSEA_MAX_REQUESTS_SECONDS', 1),
        ],
    ],

    'google_analytics' => [
        'tracking_code' => env('GOOGLE_ANALYTICS_TRACKING_CODE'),
    ],

    'discord' => [
        'invite_code_api_url' => env('DISCORD_INVITE_API_URL'),
    ],

    'polly' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        'bucket' => env('AWS_BUCKET'),
    ],

    'browsershot' => [
        'timeout' => (int) env('BROWSERSHOT_TIMEOUT', 60),
        'node_binary' => env('BROWSERSHOT_NODE_BINARY', '/usr/local/bin/node'),
        'npm_binary' => env('BROWSERSHOT_NPM_BINARY', '/usr/local/bin/npm'),
    ],

];
