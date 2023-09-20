<?php

declare(strict_types=1);

return [
    'landing' => 'https://dashbrd.com',
    'cookie_policy' => 'https://dashbrd.com/cookie-policy',
    'privacy_policy' => 'https://dashbrd.com/privacy-policy',
    'terms_of_service' => 'https://dashbrd.com/terms-of-service',
    'twitter' => 'https://x.com/DashbrdApp',
    'discord' => 'https://discord.gg/MJyWKkCJ5k',
    'github' => 'https://github.com/ArdentHQ/dashbrd',
    'coingecko' => 'https://www.coingecko.com',
    'etherscan' => 'https://etherscan.io',
    'polygonscan' => 'https://polygonscan.com',
    'alchemy' => 'https://www.alchemy.com',
    'moralis' => 'https://moralis.io',
    'mnemonic' => 'https://www.mnemonichq.com',
    'explorers' => [
        'etherscan' => [
            'token_transactions' => 'https://etherscan.io/token/:token?a=:address',
            'addresses' => 'https://etherscan.io/address/:address',
            'transactions' => 'https://etherscan.io/tx/:id',
            'nft' => 'https://etherscan.io/nft/:address/:nftId',
        ],
        'polygonscan' => [
            'token_transactions' => 'https://polygonscan.com/token/:token?a=:address',
            'addresses' => 'https://polygonscan.com/address/:address',
            'transactions' => 'https://polygonscan.com/tx/:id',
            'nft' => 'https://polygonscan.com/nft/:address/:nftId',
        ],
        'mumbai' => [
            'token_transactions' => 'https://mumbai.polygonscan.com/token/:token?a=:address',
            'addresses' => 'https://mumbai.polygonscan.com/address/:address',
            'transactions' => 'https://mumbai.polygonscan.com/tx/:id',
            'nft' => 'https://mumbai.polygonscan.com/nft/:address/:nftId',
        ],
        'goerli' => [
            'token_transactions' => 'https://goerli.etherscan.io/token/:token?a=:address',
            'addresses' => 'https://goerli.etherscan.io/address/:address',
            'transactions' => 'https://goerli.etherscan.io/tx/:id',
            'nft' => 'https://goerli.etherscan.io/nft/:address/:nftId',
        ],
    ],
];
