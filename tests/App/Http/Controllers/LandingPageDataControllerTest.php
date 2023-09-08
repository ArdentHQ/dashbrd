<?php

declare(strict_types=1);

use App\Models\Wallet;
use Atymic\Twitter\Twitter as TwitterContract;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

it('should load the followers data if settings are set', function () {
    Config::set('twitter.consumer_key', 'key');

    Config::set('services.discord.invite_code_api_url', 'https://discord.com/api/v9/invites/MJyWKkCJ5k?with_counts=true&with_expiration=true');

    Http::fake([
        'https://discord.com/api/*' => Http::response(fixtureData('discord_invite_api')),
    ]);

    $this->mock(TwitterContract::class)->shouldReceive('getUser')->andReturn([
        'data' => [
            'public_metrics' => [
                'followers_count' => 760,
                'following_count' => 603,
                'tweet_count' => 2038,
                'listed_count' => 36,
            ],
            'username' => 'dashbrdapp',
            'id' => '12345678',
            'name' => 'Dashbrd',
        ],
    ]);

    $response = $this->get(route('landing-data'))->assertStatus(200);

    expect($response->json())->toEqual([
        'xFollowersFormatted' => '760',
        'discordMembersFormatted' => '2',
        'wallets' => '0',
    ]);
});

it('should return the landing page data without loading the data if settings are not set', function () {
    Config::set('twitter.consumer_key', null);

    Config::set('services.discord.invite_code_api_url', null);

    $response = $this->get(route('landing-data'))->assertStatus(200);

    expect($response->json())->toEqual([
        'xFollowersFormatted' => '0',
        'discordMembersFormatted' => '0',
        'wallets' => '0',
    ]);
});

it('should return the landing page data without loading the data if already stored', function () {
    Cache::set('twitter_followers', 10);

    Cache::set('discord_members', 10);

    Wallet::factory()->count(3)->create();

    $response = $this->get(route('landing-data'))->assertStatus(200);

    expect($response->json())->toEqual([
        'xFollowersFormatted' => '10',
        'discordMembersFormatted' => '10',
        'wallets' => '3',
    ]);
});
