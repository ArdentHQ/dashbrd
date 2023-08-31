<?php

declare(strict_types=1);

use App\Enums\DateFormat;
use App\Models\Network;
use App\Models\Token;
use App\Models\User;
use App\Models\Wallet;
use App\Rules\ValidChain;
use App\Rules\WalletAddress;
use App\Rules\WalletSignature;
use App\Support\Facades\Signature;

it('should handle an incoming authentication request for a new user', function () {
    Token::factory()->matic()->create();

    $network = Network::polygon()->first();

    Signature::shouldReceive('buildSignMessage')
        ->andReturn('')
        ->once()
        ->shouldReceive('verify')
        ->andReturn(true)
        ->once()
        ->shouldReceive('getSessionNonce')
        ->andReturn('')
        ->once()
        ->shouldReceive('forgetSessionNonce')
        ->once();

    $this->post(route('login'), [
        'address' => '0x1231231231231231231231231231231231231231',
        'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
        'chainId' => $network->chain_id,
    ])->assertRedirect(route('dashboard'));
});

it('should handle an incoming authentication request for a user with a new wallet', function () {
    $network = Network::polygon()->first();
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'address' => '0x1231231231231231231231231231231231231231',
    ]);

    $user->wallet()->associate($wallet);
    $user->save();

    Signature::shouldReceive('buildSignMessage')
        ->andReturn('')
        ->once()
        ->shouldReceive('verify')
        ->andReturn(true)
        ->once()
        ->shouldReceive('getSessionNonce')
        ->andReturn('')
        ->once()
        ->shouldReceive('forgetSessionNonce')
        ->once();

    $this->actingAs($user)
        ->post(route('login'), [
            'address' => '0x0000000000000000000000000000000000001010',
            'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
            'chainId' => $network->chain_id,
        ])->assertRedirect(route('dashboard'));
});

it('should handle an incoming authentication request for an existing user', function () {
    $network = Network::polygon()->first();
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'address' => '0x2231231231231231231231231231231231231231',
    ]);

    $user->wallet()->associate($wallet);
    $user->save();

    Signature::shouldReceive('buildSignMessage')
        ->andReturn('')
        ->once()
        ->shouldReceive('verify')
        ->andReturn(true)
        ->once()
        ->shouldReceive('getSessionNonce')
        ->andReturn('')
        ->once()
        ->shouldReceive('forgetSessionNonce')
        ->once();

    $this->actingAs($user)
        ->post(route('login'), [
            'address' => $wallet->address,
            'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
            'chainId' => $network->chain_id,
        ])->assertRedirect(route('dashboard'));
});

it('should handle an invalid incoming authentication request', function () {
    $nonce = 'test';

    Signature::shouldReceive('buildSignMessage')
        ->andReturn(trans('auth.wallet.sign_message', ['nonce' => $nonce]))
        ->once()
        ->shouldReceive('verify')
        ->andReturn(false)
        ->once()
        ->shouldReceive('getSessionNonce')
        ->andReturn($nonce)
        ->once();

    $network = Network::polygon()->first();

    $this->post(route('login'), [
        'address' => '0x2231231231231231231231231231231231231231',
        'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
        'chainId' => $network->chain_id,
    ])->assertSessionHasErrors([
        'address' => trans('auth.failed'),
    ])->assertRedirect(route('dashboard'));
});

it('should throw a validation exception when nonce is not available in session', function () {
    Signature::shouldReceive('getSessionNonce')->andReturn(null)->once();

    $network = Network::polygon()->first();

    $this->post(route('login'), [
        'address' => '0x2231231231231231231231231231231231231231',
        'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
        'chainId' => $network->chain_id,
    ])->assertSessionHasErrors([
        'address' => trans('auth.session_timeout'),
    ])->assertRedirect(route('dashboard'));
});

it('should validate data on incoming authentication request', function () {
    $network = Network::polygon()->first();

    $this->post(route('login'), [])
        ->assertSessionHasErrors([
            'address' => trans('validation.required', ['attribute' => 'address']),
            'signature' => trans('validation.required', ['attribute' => 'signature']),
            'chainId' => trans('validation.required', ['attribute' => 'chain id']),
        ]);

    $this->post(route('login'), [
        'address' => trans('validation.required', ['attribute' => 'address']),
        'signature' => trans('validation.required', ['attribute' => 'signature']),
        'chainId' => 999,
    ])->assertSessionHasErrors([
        'address' => (new WalletAddress)->message(),
        'signature' => (new WalletSignature)->message(),
        'chainId' => (new ValidChain)->message(),
    ]);
});

it('should sign a message', function () {
    $network = Network::polygon()->first();

    Signature::shouldReceive('buildSignMessage')
        ->andReturn('test message')
        ->once()
        ->shouldReceive('nonce')
        ->andReturn('test nonce')
        ->once()
        ->shouldReceive('storeSessionNonce')
        ->andReturn('')
        ->once();

    $this->post(route('sign-message'), ['chainId' => $network->chain_id])
        ->assertJson(['message' => 'test message']);
});

it('should validate data when signing a message', function () {
    $network = Network::polygon()->first();

    $this->post(route('sign-message'), [])
        ->assertSessionHasErrors([
            'chainId' => trans('validation.required', ['attribute' => 'chain id']),
        ]);

    $this->post(route('sign-message'), ['chainId' => 999])
        ->assertSessionHasErrors([
            'chainId' => (new ValidChain)->message(),
        ]);
});

it('should switch account', function () {
    $network = Network::polygon()->first();
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create();

    $user->wallet()->associate($wallet);
    $user->save();

    $newWallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'address' => '0x1231231231231231231231231231231231231231',
        'total_usd' => 1,
    ]);

    $this->actingAs($user)
        ->post(route('switch-account'), [
            'address' => $newWallet->address,
            'chainId' => $network->chain_id,
        ])
        ->assertRedirect(route('dashboard'));

    expect($user->fresh()->wallet_id)->toBe($newWallet->id);
});

it('should throw error when switching account with unknown address', function () {
    $network = Network::polygon()->first();
    $user = User::factory()->create();
    $oldWallet = Wallet::factory()->create();

    $user->wallet()->associate($oldWallet);
    $user->save();

    $this->actingAs($user)
        ->post(route('switch-account'), [
            'address' => '0x0000000000000000000000000000000000001010',
            'chainId' => $network->chain_id,
        ])
        ->assertSessionHasErrors([
            'address' => trans('auth.wallet.requires_signature'),
        ]);

    expect($user->fresh()->wallet_id)->toBe($oldWallet->id);
});

it('should throw error when switching account on a different network', function () {
    $user = User::factory()->create();
    $oldWallet = Wallet::factory()->create();

    $user->wallet()->associate($oldWallet);
    $user->save();

    $this->actingAs($user)
        ->post(route('switch-account'), [
            'address' => '0x1231231231231231231231231231231231231232',
            'chainId' => 10,
        ])
        ->assertSessionHasErrors([
            'address' => trans('auth.wallet.requires_signature'),
        ]);

    expect($user->fresh()->wallet_id)->toBe($oldWallet->id);
});

it('should destroy the session', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create();

    $user->wallet()->associate($wallet);
    $user->save();

    $this->actingAs($user)
        ->post(route('logout'))
        ->assertRedirect(route('dashboard'));
});

it("stores user's timezone if specified", function () {
    $network = Network::polygon()->first();

    Signature::shouldReceive('buildSignMessage')
        ->andReturn('')
        ->once()
        ->shouldReceive('verify')
        ->andReturn(true)
        ->once()
        ->shouldReceive('getSessionNonce')
        ->andReturn('')
        ->once()
        ->shouldReceive('forgetSessionNonce')
        ->once();

    $this->post(route('login'), [
        'address' => '0x1231231231231231231231231231231231231231',
        'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
        'chainId' => $network->chain_id,
        'tz' => 'Europe/Zagreb',
        'locale' => 'en-GB',
    ])->assertRedirect(route('dashboard'));

    $user = User::first();

    expect($user->extra_attributes->currency)->toBe('GBP');
    expect($user->extra_attributes->date_format)->toBe(DateFormat::D->value);
    expect($user->extra_attributes->time_format)->toBe('24');
    expect($user->extra_attributes->timezone)->toBe('Europe/Zagreb');
});

it("defaults user's timezone to UTC if not specified", function () {
    $network = Network::polygon()->first();

    Signature::shouldReceive('buildSignMessage')
        ->andReturn('')
        ->once()
        ->shouldReceive('verify')
        ->andReturn(true)
        ->once()
        ->shouldReceive('getSessionNonce')
        ->andReturn('')
        ->once()
        ->shouldReceive('forgetSessionNonce')
        ->once();

    $this->post(route('login'), [
        'address' => '0x1231231231231231231231231231231231231231',
        'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
        'chainId' => $network->chain_id,
    ])->assertRedirect(route('dashboard'));

    $user = User::first();

    expect($user->extra_attributes->currency)->toBe('USD');
    expect($user->extra_attributes->date_format)->toBe(DateFormat::D->value);
    expect($user->extra_attributes->time_format)->toBe('24');
    expect($user->extra_attributes->timezone)->toBe('UTC');
});

it("defaults user's timezone to UTC if timezone is not valid", function () {
    $network = Network::polygon()->first();

    Signature::shouldReceive('buildSignMessage')
        ->andReturn('')
        ->once()
        ->shouldReceive('verify')
        ->andReturn(true)
        ->once()
        ->shouldReceive('getSessionNonce')
        ->andReturn('')
        ->once()
        ->shouldReceive('forgetSessionNonce')
        ->once();

    $this->post(route('login'), [
        'address' => '0x1231231231231231231231231231231231231231',
        'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
        'chainId' => $network->chain_id,
        'tz' => 'Something/Random',
    ])->assertRedirect(route('dashboard'));

    $user = User::first();

    expect($user->extra_attributes->currency)->toBe('USD');
    expect($user->extra_attributes->date_format)->toBe(DateFormat::D->value);
    expect($user->extra_attributes->time_format)->toBe('24');
    expect($user->extra_attributes->timezone)->toBe('UTC');
});

it('defaults currency to USD if locale is not valid', function () {
    $network = Network::polygon()->first();

    Signature::shouldReceive('buildSignMessage')
        ->andReturn('')
        ->once()
        ->shouldReceive('verify')
        ->andReturn(true)
        ->once()
        ->shouldReceive('getSessionNonce')
        ->andReturn('')
        ->once()
        ->shouldReceive('forgetSessionNonce')
        ->once();

    $this->post(route('login'), [
        'address' => '0x1231231231231231231231231231231231231231',
        'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
        'chainId' => $network->chain_id,
        'tz' => 'Europe/Zagreb',
        'locale' => 'invalid',
    ])->assertRedirect(route('dashboard'));

    $user = User::first();

    expect($user->extra_attributes->currency)->toBe('USD');
    expect($user->extra_attributes->date_format)->toBe(DateFormat::D->value);
    expect($user->extra_attributes->time_format)->toBe('24');
    expect($user->extra_attributes->timezone)->toBe('Europe/Zagreb');
});
