<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines are used during authentication for various
    | messages that we need to display to the user. You are free to modify
    | these language lines according to your application's requirements.
    |
    */

    'welcome' => 'Welcome to Dashbrd',
    'logged_in' => "You're logged in!",
    'log_out' => 'Log out',

    'failed' => 'These credentials do not match our records.',
    'session_timeout' => 'Your session has timed out. Please refresh the page and try connecting your account again.',
    'password' => 'The provided password is incorrect.',
    'throttle' => 'Too many login attempts. Please try again in :seconds seconds.',

    'wallet' => [
        'connecting' => 'Connecting …',
        'switching_wallet' => 'Switching Wallet …',
        'connect' => 'Connect Wallet',
        'connect_long' => 'Connect Your Wallet to Get Started',
        'disconnect' => 'Disconnect Wallet',
        'install' => 'Install MetaMask',
        'install_long' => 'Install MetaMask to Get Started',
        'sign' => 'Sign Message',
        'sign_message' => "Welcome to Dashbrd. In order to login, sign this message with your wallet. It doesn't cost you anything!\n\nSigning ID (you can ignore this): :nonce",
        'connect_subtitle' => 'Click on the MetaMask icon in your browser to confirm the action and connect your wallet.',
        'requires_signature' => 'Changing your primary address requires a new signature. Click the Sign Message button above to connect your new address.',
    ],

    'errors' => [
        'metamask' => [
            'no_account' => 'No account found. Please connect your wallet and try again.',
            'generic' => 'Connection attempt error. Please retry and follow the steps to connect your wallet.',
            'invalid_network' => 'Please switch to Polygon or Ethereum Mainnet in your MetaMask plugin to connect to Dashbrd.',
            'provider_missing' => "You don't have MetaMask installed in your browser. Please install and try again.",
            'user_rejected' => 'It looks like you cancelled signing of the authentication message. Please try again.',
            'provider_not_set' => 'Ethereum provider is not set',
        ],
    ],

    'validation' => [
        'wallet_login_failed' => 'There was a problem trying to verify your signature. Please try again.',
        'invalid_address' => 'Your wallet address is invalid. Please try again.',
        'invalid_signature' => 'Signature is invalid. Please try again.',
        'invalid_network' => 'Please switch to Polygon or Ethereum Mainnet in your MetaMask plugin to connect to Dashbrd.',
    ],
];
