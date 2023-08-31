<?php

declare(strict_types=1);

use Atymic\Twitter\Twitter as TwitterContract;
use Illuminate\Support\Facades\Cache;

it('updates the twitter followers in the settings', function () {
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

    $this->artisan('landing:update-twitter-followers');

    expect(Cache::get('twitter_followers'))->toEqual(760);
});

it('handles invalid response', function () {
    Cache::set('twitter_followers', 10);

    $this->mock(TwitterContract::class)->shouldReceive('getUser')->andReturn([
        'data' => [
            'invalid' => 'response',
        ],
    ]);

    $this->artisan('landing:update-twitter-followers');

    expect(Cache::get('twitter_followers'))->toEqual(10);
})->throws('Unable to get Twitter followers count');
