<?php

declare(strict_types=1);

use App\Enums\DateFormat;
use App\Support\Facades\Signature;

it('can render the General Settings page', function () {
    $user = createUser();

    $this->actingAs($user)
        ->get(route('settings.general'))
        ->assertStatus(200);
});

it('cant update user general preferences if not signed', function () {
    $user = createUser([
        'extra_attributes' => [
            'currency' => 'USD',
            'date_format' => DateFormat::D,
            'time_format' => '24',
            'timezone' => 'UTC',
        ],
    ]);

    $this->actingAs($user)
        ->put(route('settings.general'), [
            'currency' => 'EUR',
            'date_format' => DateFormat::C->value,
            'time_format' => '12',
            'timezone' => 'Europe/Amsterdam',
        ])
        ->assertRedirect();
});

describe('user is signed', function () {
    beforeEach(function () {
        Signature::shouldReceive('walletIsSigned')
            ->andReturn(true);
    });

    it('can update user general preferences', function () {
        $user = createUser([
            'extra_attributes' => [
                'currency' => 'USD',
                'date_format' => DateFormat::D,
                'time_format' => '24',
                'timezone' => 'UTC',
            ],
        ]);

        $this->actingAs($user)
            ->put(route('settings.general'), [
                'currency' => 'EUR',
                'date_format' => DateFormat::C->value,
                'time_format' => '12',
                'timezone' => 'Europe/Amsterdam',
            ]);

        $user->refresh();

        expect($user->extra_attributes['currency'])->toBe('EUR');
        expect($user->extra_attributes['date_format'])->toBe(DateFormat::C->value);
        expect($user->extra_attributes['time_format'])->toBe('12');
        expect($user->extra_attributes['timezone'])->toBe('Europe/Amsterdam');
    });

    it('requires currency to be a valid currency', function () {
        $user = createUser([
            'extra_attributes' => [
                'currency' => 'USD',
                'date_format' => DateFormat::D,
                'time_format' => '24',
                'timezone' => 'UTC',
            ],
        ]);

        $this->actingAs($user)
            ->put(route('settings.general'), [
                'currency' => 'invalid',
                'date_format' => DateFormat::C->value,
                'time_format' => '12',
                'timezone' => 'Europe/Amsterdam',
            ])->assertSessionHasErrors('currency');

        $user->refresh();

        expect($user->extra_attributes['currency'])->toBe('USD');
        expect($user->extra_attributes['date_format'])->toBe(DateFormat::D->value);
        expect($user->extra_attributes['time_format'])->toBe('24');
        expect($user->extra_attributes['timezone'])->toBe('UTC');
    });

    it('requires date format to be a valid format', function () {
        $user = createUser([
            'extra_attributes' => [
                'currency' => 'USD',
                'date_format' => DateFormat::D,
                'time_format' => '24',
                'timezone' => 'UTC',
            ],
        ]);

        $this->actingAs($user)
            ->put(route('settings.general'), [
                'currency' => 'EUR',
                'date_format' => 'invalid',
                'time_format' => '12',
                'timezone' => 'Europe/Amsterdam',
            ])->assertSessionHasErrors('date_format');

        $user->refresh();

        expect($user->extra_attributes['currency'])->toBe('USD');
        expect($user->extra_attributes['date_format'])->toBe(DateFormat::D->value);
        expect($user->extra_attributes['time_format'])->toBe('24');
        expect($user->extra_attributes['timezone'])->toBe('UTC');
    });

    it('requires time format to be a either 12 or 24', function () {
        $user = createUser([
            'extra_attributes' => [
                'currency' => 'USD',
                'date_format' => DateFormat::D,
                'time_format' => '24',
                'timezone' => 'UTC',
            ],
        ]);

        $this->actingAs($user)
            ->put(route('settings.general'), [
                'currency' => 'EUR',
                'date_format' => DateFormat::C->value,
                'time_format' => '36',
                'timezone' => 'Europe/Amsterdam',
            ])->assertSessionHasErrors('time_format');

        $user->refresh();

        expect($user->extra_attributes['currency'])->toBe('USD');
        expect($user->extra_attributes['date_format'])->toBe(DateFormat::D->value);
        expect($user->extra_attributes['time_format'])->toBe('24');
        expect($user->extra_attributes['timezone'])->toBe('UTC');
    });

    it('requires timezone to be valid', function () {
        $user = createUser([
            'extra_attributes' => [
                'currency' => 'USD',
                'date_format' => DateFormat::D,
                'time_format' => '24',
                'timezone' => 'UTC',
            ],
        ]);

        $this->actingAs($user)
            ->put(route('settings.general'), [
                'currency' => 'EUR',
                'date_format' => DateFormat::C->value,
                'time_format' => '12',
                'timezone' => 'something/inavlid',
            ])->assertSessionHasErrors('timezone');

        $user->refresh();

        expect($user->extra_attributes['currency'])->toBe('USD');
        expect($user->extra_attributes['date_format'])->toBe(DateFormat::D->value);
        expect($user->extra_attributes['time_format'])->toBe('24');
        expect($user->extra_attributes['timezone'])->toBe('UTC');
    });
});
