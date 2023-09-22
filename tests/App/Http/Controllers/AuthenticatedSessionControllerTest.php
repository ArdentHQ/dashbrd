<?php

declare(strict_types=1);

use App\Enums\DateFormat;
use App\Models\Network;
use App\Models\Token;
use App\Models\User;
use App\Models\Wallet;
use App\Rules\ValidChain;
use App\Rules\WalletAddress;
use App\Support\Facades\Signature;
use Illuminate\Support\Facades\Auth;

it('should sign a user', function () {
    Token::factory()->matic()->create();

    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'address' => '0x2231231231231231231231231231231231231231',
    ]);
    $user->wallet()->associate($wallet);
    $user->save();

    $network = Network::polygon();

    Signature::shouldReceive('buildSignMessage')
        ->andReturn('')
        ->once()
        ->shouldReceive('verify')
        ->andReturn(true)
        ->once()
        ->shouldReceive('getSessionNonce')
        ->andReturn('')
        ->once()
        ->shouldReceive('setWalletIsSigned')
        ->once()
        ->andReturnUndefined()
        ->shouldReceive('forgetSessionNonce')
        ->once()
        ->andReturnUndefined()
        ->shouldReceive('walletIsSigned')
        ->once()
        ->andReturn(true);

    $response = $this->actingAs($user)->post(route('sign'), [
        'address' => '0x1231231231231231231231231231231231231231',
        'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
        'chainId' => $network->chain_id,
    ]);

    $data = $response->json();

    expect($response->status())->toBe(200)
        ->and($data['auth']['signed'])->toBeTrue()
        ->and($data['auth']['authenticated'])->toBeTrue();
});

it('should throw a validation exception when nonce is not available in session', function () {
    Signature::shouldReceive('getSessionNonce')->andReturn(null)->once();

    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'address' => '0x2231231231231231231231231231231231231231',
    ]);
    $user->wallet()->associate($wallet);
    $user->save();

    $network = Network::polygon()->first();

    $this->actingAs($user)->post(route('sign'), [
        'address' => '0x2231231231231231231231231231231231231231',
        'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
        'chainId' => $network->chain_id,
    ])->assertSessionHasErrors([
        'address' => trans('auth.session_timeout'),
    ])->assertRedirect(route('galleries'));
});

it('should throw a validation exception if signature cannot be verified', function () {
    Signature::shouldReceive('getSessionNonce')->andReturn('')->once()
        ->shouldReceive('buildSignMessage')->andReturnSelf()->once()
        ->shouldReceive('verify')->andReturn(false)->once()
        ->shouldReceive('setWalletIsNotSigned')->once();

    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'address' => '0x2231231231231231231231231231231231231231',
    ]);
    $user->wallet()->associate($wallet);
    $user->save();

    $network = Network::polygon()->first();

    $this->actingAs($user)->post(route('sign'), [
        'address' => '0x2231231231231231231231231231231231231231',
        'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
        'chainId' => $network->chain_id,
    ])->assertSessionHasErrors([
        'address' => trans('auth.failed'),
    ])->assertRedirect(route('galleries'));
});

it('should handle an incoming authentication request for a new user', function () {
    Token::factory()->matic()->create();

    $network = Network::polygon()->first();

    $response = $this->post(route('login'), [
        'address' => '0x1231231231231231231231231231231231231231',
        'chainId' => $network->chain_id,
    ]);

    $data = $response->json();

    expect($response->status())->toBe(200)
        ->and($data['auth']['signed'])->toBeFalse()
        ->and($data['auth']['authenticated'])->toBeTrue();
});

it('should handle invalid credentials', function () {
    Auth::shouldReceive('attempt')
        ->andReturn(false)
        ->once()
        ->shouldReceive('userResolver')
        ->andReturn(fn () => null)
        ->shouldReceive('guard')
        ->andReturnSelf()
        ->shouldReceive('user')
        ->andReturn(null)
        ->shouldReceive('hasUser')
        ->andReturn(false);

    Token::factory()->matic()->create();

    $network = Network::polygon()->first();

    $this->post(route('login'), [
        'address' => '0x1231231231231231231231231231231231231231',
        'chainId' => $network->chain_id,
    ])->assertRedirect(route('galleries'));
});

it('should handle an incoming authentication request for a user with a new wallet', function () {
    $network = Network::polygon();
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'address' => '0x1231231231231231231231231231231231231231',
    ]);

    $user->wallet()->associate($wallet);
    $user->save();

    $response = $this->actingAs($user)
        ->post(route('login'), [
            'address' => '0x0000000000000000000000000000000000001010',
            'chainId' => $network->chain_id,
        ]);

    $data = $response->json();

    expect($response->status())->toBe(200)
        ->and($data['auth']['signed'])->toBeFalse()
        ->and($data['auth']['authenticated'])->toBeTrue();
});

it('should handle an incoming authentication request for an existing user', function () {
    $network = Network::polygon();
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'address' => '0x2231231231231231231231231231231231231231',
    ]);

    $user->wallet()->associate($wallet);
    $user->save();

    $response = $this->actingAs($user)
        ->post(route('login'), [
            'address' => $wallet->address,
            'chainId' => $network->chain_id,
        ]);

    $data = $response->json();

    expect($response->status())->toBe(200)
        ->and($data['auth']['signed'])->toBeFalse()
        ->and($data['auth']['authenticated'])->toBeTrue();
});

it('should handle an invalid incoming authentication request', function () {
    $network = Network::polygon();

    $this->post(route('login'), [
        'address' => 'invalid',
        'chainId' => $network->chain_id,
    ])->assertSessionHasErrors([
        'address' => trans('auth.validation.invalid_address'),
    ])->assertRedirect(route('galleries'));
});

it('should validate data on incoming authentication request', function () {
    $network = Network::polygon();

    $this->post(route('login'), [])
        ->assertSessionHasErrors([
            'address' => trans('validation.required', ['attribute' => 'address']),
            'chainId' => trans('validation.required', ['attribute' => 'chain id']),
        ]);

    $this->post(route('login'), [
        'address' => trans('validation.required', ['attribute' => 'address']),
        'chainId' => 999,
    ])->assertSessionHasErrors([
        'address' => (new WalletAddress)->message(),
        'chainId' => (new ValidChain)->message(),
    ]);
});

it('should sign a message', function () {
    $network = Network::polygon();

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
    $network = Network::polygon();

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
    $network = Network::polygon();
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create();

    $user->wallet()->associate($wallet);
    $user->save();

    $newWallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'address' => '0x1231231231231231231231231231231231231231',
        'total_usd' => 1,
    ]);

    $response = $this->actingAs($user)
        ->post(route('login'), [
            'address' => $newWallet->address,
            'chainId' => $network->chain_id,
        ]);

    $data = $response->json();

    expect($response->status())->toBe(200)
        ->and($data['auth']['signed'])->toBeFalse()
        ->and($data['auth']['authenticated'])->toBeTrue()
        ->and($user->fresh()->wallet_id)->toBe($newWallet->id);

});

it('should destroy the session and redirect', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create();

    $user->wallet()->associate($wallet);
    $user->save();

    $this->actingAs($user)
        ->post(route('logout'))
        ->assertRedirect(route('galleries'));
});

it('should destroy the session and return response', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create();

    $user->wallet()->associate($wallet);
    $user->save();

    $response = $this->actingAs($user)
        ->postJson(route('logout'), [], ['Referer' => '/collections']);

    expect($response->status())->toBe(200)
        ->and($response->json('redirectTo'))->toBe('galleries');

});

it("defaults user's timezone to UTC and currency to USD", function () {
    $network = Network::polygon();

    $this->post(route('login'), [
        'address' => '0x1231231231231231231231231231231231231231',
        'chainId' => $network->chain_id,
    ])->assertStatus(200);

    $user = User::first();

    expect($user->extra_attributes->currency)->toBe('USD');
    expect($user->extra_attributes->date_format)->toBe(DateFormat::D->value);
    expect($user->extra_attributes->time_format)->toBe('24');
    expect($user->extra_attributes->timezone)->toBe('UTC');
});
