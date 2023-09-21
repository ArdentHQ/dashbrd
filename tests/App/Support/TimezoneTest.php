<?php

declare(strict_types=1);

use App\Support\Timezone;

it('can get all timezones', function () {
    $timezones = Timezone::all();

    expect($timezones)->toBeArray();
    expect($timezones)->toContain('UTC');
});

it('can get formatted timezones', function () {
    $timezones = Timezone::formatted();

    expect($timezones)->toBeArray();

    expect($timezones)->toContain([
        'key' => 'UTC',
        'label' => '(UTC+00:00) UTC',
    ]);
});
