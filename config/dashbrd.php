<?php

declare(strict_types=1);

use App\Enums\Period;

return [
    'browsershot' => [
        'timeout' => (int) env('BROWSERSHOT_TIMEOUT', 60),
        'node_binary' => env('BROWSERSHOT_NODE_BINARY', '/usr/local/bin/node'),
        'npm_binary' => env('BROWSERSHOT_NPM_BINARY', '/usr/local/bin/npm'),
    ],
    'contact_email' => env('CONTACT_EMAIL', 'support@ardenthq.com'),

    'features' => [
        'portfolio' => env('PORTFOLIO_ENABLED', true),
        'galleries' => env('GALLERIES_ENABLED', true),
        'collections' => env('COLLECTIONS_ENABLED', true),
        'activities' => env('ACTIVITIES_ENABLED', false),
    ],

    'testing_wallet' => env('LOCAL_TESTING_ADDRESS'),
    'testnet_enabled' => env('TESTNET_ENABLED', env('APP_ENV') !== 'production'),
    'live_dump_wallets' => explode(',', env('LIVE_DUMP_WALLETS', '')),

    'user_activity_ttl' => env('USER_ACTIVITY_CACHE_TTL', 60),
    'galleries_stats_ttl' => env('GALLERIES_STATS_TTL', 60),

    'wallets' => [
        // Time since last activity to consider a wallet as active
        // Active wallets are the ones that are considered when updating data
        // such as the domain or the avatar for example.
        'active_threshold' => env('WALLET_ACTIVE_THRESHOLD', 60 * 60 * 24), // 1 day
        // Time since last activity to consider a wallet as online
        'online_threshold' => env('WALLET_ONLINE_THRESHOLD', 60), // 1 minute

        'line_chart' => [
            'sample_count' => 18,
            'period' => Period::WEEK->value,
        ],
    ],

    'tokens' => [
        'priority_scores' => [
            'points_per_wallet' => env('TOKENS_PRIORITY_SCORES_POINTS_PER_WALLET', 1),

            // Consider that an active wallet also receive points for being
            // a token wallet wich means that points are summed up.
            'points_per_active_wallet' => env('TOKENS_PRIORITY_SCORES_POINTS_PER_ACTIVE_WALLET', 10),

            // Consider that an online wallet is also active which means that
            // points are summed up with active and per_wallet.
            'points_per_online_wallet' => env('TOKENS_PRIORITY_SCORES_POINTS_PER_ONLINE_WALLET', 50),

            // As reference, at the time of writing the scores, these are
            // the market cap from some common tokens:
            // are:
            // - BNB: 33,481,717,339 (about 33 * 2 points)
            // - SOL: 8,855,524,846 (about 8 * 2 points)
            // - MATIC: 5,263,864,589 (about 5 * 2 points)
            // - LINK: 3,438,001,339 (about 3 * 2 points)
            'points_per_market_cap' => [
                'per' => env('TOKENS_PRIORITY_SCORES_POINTS_PER_MARKET_CAP_PER', 1_000_000_000),
                'points' => env('TOKENS_PRIORITY_SCORES_POINTS_PER_MARKET_CAP_POINTS', 2),
            ],
        ],
    ],

    'web3_providers' => [
        'default' => env('DEFAULT_WEB3_DATA_PROVIDER', 'alchemy'),
        App\Jobs\FetchTokens::class => env('WEB3_PROVIDER_FETCH_TOKENS', 'moralis'),
        App\Jobs\FetchWalletNfts::class => 'alchemy', // No other provider gives us `totalSupply` that we use in jobs...
        App\Jobs\FetchCollectionNfts::class => 'alchemy', // No other provider gives us `totalSupply` that we use in jobs...
        App\Jobs\FetchEnsDetails::class => 'moralis',
        App\Jobs\FetchNativeBalances::class => env('WEB3_PROVIDER_FETCH_NATIVE_BALANCES', 'moralis'),
        App\Jobs\FetchCollectionFloorPrice::class => env('WEB3_PROVIDER_FETCH_NFT_COLLECTION_FLOOR_PRICE', 'opensea'),
        App\Jobs\DetermineCollectionMintingDate::class => env('WEB3_PROVIDER_DETERMINE_COLLECTION_MINTING_DATE', 'alchemy'),
    ],

    'cache_ttl' => [
        'alchemy' => [
            'getBlockTimestamp' => 60 * 60 * 24 * 10, // 10 days... Creation date for blocks will never change, so we can safely cache in a distant future...
            'getNftCollectionFloorPrice' => 60, // 1 minute
        ],
        'moralis' => [
            'getEnsDomain' => 60, // 1 minute
            'getBlockTimestamp' => 60 * 60 * 24 * 10, // 10 days... Creation date for blocks will never change, so we can safely cache in a distant future...
            'getNftCollectionFloorPrice' => 60, // 1 minute
        ],
        'mnemonic' => [
            'getBlockTimestamp' => 60 * 60 * 24 * 10, // 10 days... Creation date for blocks will never change, so we can safely cache in a distant future...
            'getNftCollectionFloorPrice' => 60, // 1 minute
        ],
        'opensea' => [
            'getNftCollectionFloorPrice' => 60, // 1 minute
        ],
        'coingecko' => [
            'getPriceHistory' => [
                Period::DAY->value => env('API_CACHE_TTL_COINGECKO_PRICE_HISTORY_DAY_TTL', 60 * 60), // 1 hour
                Period::WEEK->value => env('API_CACHE_TTL_COINGECKO_PRICE_HISTORY_WEEK_TTL', 60 * 60 * 24), // 1 day
                Period::MONTH->value => env('API_CACHE_TTL_COINGECKO_PRICE_HISTORY_MONTH_TTL', 60 * 60 * 24), // 1 day
                Period::YEAR->value => env('API_CACHE_TTL_COINGECKO_PRICE_HISTORY_YEAR_TTL', 60 * 60 * 24), // 1 day
                Period::YEARS_15->value => env('API_CACHE_TTL_COINGECKO_PRICE_HISTORY_YEARS15_TTL', 60 * 60 * 24),
                // 1 day
            ],
        ],

    ],

    'token_spam' => [
        'max_name_length' => env('TOKEN_SPAM_MAX_NAME_LENGTH', 30),
        'max_symbol_length' => env('TOKEN_SPAM_MAX_SYMBOL_LENGTH', 6),
        'filter_type' => env('TOKEN_SPAM_FILTER_TYPE', 'strict'),
    ],

    'gallery' => [
        'popularity_score' => [
            'view' => env('GALLERY_VIEW_SCORE_POINTS', 1),
            'like' => env('GALLERY_LIKE_SCORE_POINTS', 10),
        ],
        'pagination' => [
            'collections_per_page' => env('GALLERY_COLLECTIONS_PER_PAGE', 20),
            'nfts_per_page' => env('GALLERY_NFTS_PER_PAGE', 20),
        ],
        'nft_limit' => 16,
        'logs' => [
            'enabled' => env('SLACK_GALLERY_LOGS_ENABLED', false),
            'slack_webhook_url' => env('SLACK_GALLERY_LOGS_WEBHOOK_URL', null),
        ],
    ],

    'collections' => [
        'throttle' => [
            'nft_refresh' => [
                'total_jobs_per_minute' => env('COLLECTIONS_NFT_REFRESH_THROTTLE_TOTAL_JOBS_PER_MINUTE', 50),
                'job_per_nft_every_minutes' => env('COLLECTIONS_NFT_REFRESH_THROTTLE_JOB_PER_NFT_EVERY_MINUTES', 15),
                'per_user_per_nft_per_minute' => env('COLLECTIONS_NFT_REFRESH_THROTTLE_REFRESH_PER_USER_PER_NTF_PER_MINUTE', 1),
            ],
        ],
    ],

    'reports' => [
        'enabled' => env('SLACK_REPORTS_ENABLED', false),
        'slack_webhook_url' => env('SLACK_REPORTS_WEBHOOK_URL', null),
        'reasons' => [
            'spam',
            'violence',
            'hate',
            'inappropriate_content',
            'impersonation',
            'trademark',
            'selfharm',
            'harassment',
        ],

        'throttle' => [
            'gallery' => [
                'per_day' => env('REPORTS_THROTTLE_GALLERY_PER_DAY', 1),
                'per_hour' => env('REPORTS_THROTTLE_GALLERY_PER_HOUR', 6),
                'same_gallery_per_hours' => env('REPORTS_THROTTLE_GALLERY_SAME_GALLERY_PER_HOURS', 48),
            ],
            'collection' => [
                'per_day' => env('REPORTS_THROTTLE_COLLECTION_PER_DAY', 1),
                'per_hour' => env('REPORTS_THROTTLE_COLLECTION_PER_HOUR', 6),
                'same_collection_per_hours' => env('REPORTS_THROTTLE_COLLECTION_SAME_COLLECTION_PER_HOURS', 48),
            ],
            'nft' => [
                'per_day' => env('REPORTS_THROTTLE_NFT_PER_DAY', 1),
                'per_hour' => env('REPORTS_THROTTLE_NFT_PER_HOUR', 6),
                'same_nft_per_hours' => env('REPORTS_THROTTLE_NFT_SAME_NFT_PER_HOURS', 48),
            ],
        ],
    ],

    'allowed_external_domains' => [],

    'api_throttle' => [
        'user_rate_limit_per_minute' => env('API_THROTTLE_USER_RATE_LIMIT_PER_MINUTE', 60 * 10), // 600 requests per minute
        'guest_rate_limit_per_minute' => env('API_THROTTLE_GUEST_RATE_LIMIT_PER_MINUTE', 60), // 60 requests per minute
    ],

    /*
    |--------------------------------------------------------------------------
    | Web3 Nft Collections
    |--------------------------------------------------------------------------
    |
    | These values define the limits for fetching NFTs
    | from a collection. They are used when our APIs are
    | called by our web3 providers.
    |
    */

    // The maximum number of NFTs that can be retrieved from a collection that belongs to a wallet that has never beed signed
    'daily_max_collection_nft_retrieval_for_unsigned_wallets' => env('DAILY_MAX_COLLECTION_NFT_RETRIEVAL_FOR_UNVERIFIED_WALLETS', 100),
    'collections_max_cap' => env('COLLECTIONS_MAX_CAP', 50000),

    'trait_value_max_length' => env('TRAIT_VALUE_MAX_LENGTH', 25),
    'seeder_traits_chunk_size' => env('SEEDER_TRAITS_CHUNK_SIZE', 50),
    'seeder_nfts_chunk_size' => env('SEEDER_NFTS_CHUNK_SIZE', 50),

    'blacklisted_collections' => [
        '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85', // ENS Domains
        '0x53a0018f919bde9c254bda697966c5f448ffddcb', // EDNS
        '0x049aba7510f45ba5b64ea9e658e342f904db358d', // Unstoppable Domains
        '0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f', // Unstoppable Domains
        '0x495f947276749ce646f68ac8c248420045cb7b5e', // OpenSea Shared Storefront
    ],

    'activity_blacklist' => [
        '0xba6666b118f8303f990f3519df07e160227cce87', // Planet IX - Assets
        '0x22d5f9b75c524fec1d6619787e582644cd4d7422', // Sunflower Land Collectibles
    ],

    'test_tokens' => [
        'TIC',
        'USDC',
        'BNB',
        'LINK',
        'RNDR',
        'BAT',
        'COMP',
        'BAL',
        'SAND',
        'WETH',
        'ETH',
    ],

    'idle_time_between_collection_activity_updates' => 6, // hours
];
