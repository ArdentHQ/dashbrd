<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Config::set('services.discord.invite_code_api_url', 'https://discord.com/api/v9/invites/MJyWKkCJ5k?with_counts=true&with_expiration=true');
});

it('updates the discord members in the settings', function () {
    Http::fake([
        'https://discord.com/api/*' => Http::response(fixtureData('discord_invite_api')),
    ]);

    $this->artisan('landing:update-discord-members');

    expect(Cache::get('discord_members'))->toEqual(2);
});

it('handles invalid response', function () {
    Cache::set('discord_members', 10);

    Http::fake([
        'https://discord.com/api/*' => Http::response([]),
    ]);

    $this->artisan('landing:update-discord-members');

    expect(Cache::get('discord_members'))->toEqual(10);
})->throws('Unable to get discord members count');
