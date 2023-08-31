<?php

declare(strict_types=1);

use App\Enums\Chains;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Auth\Web3UserProvider;
use App\Support\Facades\Signature;
use Illuminate\Contracts\Hashing\Hasher as HasherContract;

it('should validate credentials', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'address' => '0x1231231231231231231231231231231231231231',
        'user_id' => $user->id,
    ]);

    $user->wallet_id = $wallet->id;
    $user->save();

    Signature::shouldReceive('buildSignMessage')
        ->andReturn('')
        ->once()
        ->shouldReceive('verify')
        ->andReturn(true)
        ->once();

    $provider = new Web3UserProvider(HasherContract::class, User::class);
    $result = $provider->validateCredentials($user, [
        'address' => $wallet->address,
        'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
        'nonce' => '1234',
    ]);

    expect($result)->toBeTrue();
});

it('should have invalid credentials if wallet does not exist for user', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'address' => '0x1231231231231231231231231231231231231231',
        'user_id' => $user->id,
    ]);

    $user->wallet_id = $wallet->id;
    $user->save();

    $provider = new Web3UserProvider(HasherContract::class, User::class);
    $result = $provider->validateCredentials($user, [
        'address' => '0x0000000000000000000000000000000000001010',
        'signature' => '0x0000000000000000000000000000000000001010000000000000000000000000000000000000101000000000000000000000000000000000000010101010101010',
        'nonce' => '1234',
    ]);

    expect($result)->toBeFalse();
});

it('should create a fresh user with new wallet', function () {

    expect(User::count())->toBe(0);

    $provider = new Web3UserProvider(User::class);
    $user = $provider->retrieveByCredentials([
        'chainId' => Chains::Polygon->value,
        'timezone' => 'Europe/London',
        'address' => '0x1231231231231231231231231231231231231231',
    ]);

    $wallets = $user->wallets()->get();
    expect($wallets)->toHaveLength(1);
    expect(User::count())->toBe(1);
});

it('should create network wallets', function () {
    $user = User::factory()->create();

    Wallet::factory()->create([
        'address' => '0x1231231231231231231231231231231231231231',
        'user_id' => $user->id,
    ]);

    $wallets = $user->wallets()->get();
    expect($wallets)->toHaveLength(1);

    $provider = new Web3UserProvider(User::class);
    $user = $provider->retrieveByCredentials([
        'chainId' => Chains::Polygon->value,
        'address' => '0x1231231231231231231231231231231231231231',
    ]);

    $wallets = $user->wallets()->get();
    expect($wallets)->toHaveLength(1);
});

it('should create a new user when logging in with a different wallet', function () {
    $firstUser = User::factory()->create();
    Wallet::factory()->create([
        'address' => '0x1231231231231231231231231231231231231231',
        'user_id' => $firstUser->id,
    ]);

    expect(User::count())->toBe(1);

    $wallets = $firstUser->wallets()->get();
    expect($wallets)->toHaveLength(1);

    $provider = new Web3UserProvider(User::class);
    $returnedUser = $provider->retrieveByCredentials([
        'chainId' => Chains::Mumbai->value,
        'address' => '0x1231231231231231231231231231231231231231',
    ]);

    expect($returnedUser->id)->toEqual($firstUser->id);

    $wallets = $firstUser->wallets()->get();
    expect($wallets)->toHaveLength(1);

    $returnedUser = $provider->retrieveByCredentials([
        'chainId' => Chains::Mumbai->value,
        'timezone' => 'Europe/London',
        'address' => '0x'.fake()->sha1(),
    ]);

    expect($returnedUser->id)->not->toEqual($firstUser->id);
    expect(User::count())->toBe(2);

    $wallets = $returnedUser->wallets()->get();
    expect($wallets)->toHaveLength(1);
});

it('should not create a new user when switching networks', function () {
    $firstUser = User::factory()->create();
    Wallet::factory()->create([
        'address' => '0x1231231231231231231231231231231231231231',
        'user_id' => $firstUser->id,
    ]);

    expect(User::count())->toBe(1);

    $wallets = $firstUser->wallets()->get();
    expect($wallets)->toHaveLength(1);

    $provider = new Web3UserProvider(User::class);
    $returnedUser = $provider->retrieveByCredentials([
        'chainId' => Chains::Polygon->value,
        'address' => '0x1231231231231231231231231231231231231231',
    ]);

    expect($returnedUser->id)->toEqual($firstUser->id);

    $wallets = $firstUser->wallets()->get();
    expect($wallets)->toHaveLength(1);

    $returnedUser = $provider->retrieveByCredentials([
        'chainId' => Chains::Polygon->value,
        'timezone' => 'Europe/London',
        'address' => $address = '0x'.fake()->sha1(),
    ]);

    expect($returnedUser->id)->not->toEqual($firstUser->id);
    expect(User::count())->toBe(2);

    $returnedUser = $provider->retrieveByCredentials([
        'chainId' => Chains::Mumbai->value,
        'timezone' => 'Europe/London',
        'address' => $address,
    ]);

    expect($returnedUser->id)->toEqual($returnedUser->id);
    expect(User::count())->toBe(2);

    $wallets = $returnedUser->wallets()->get();
    expect($wallets)->toHaveLength(1);
});

it('should not create a new user when logging into an existing user with a new address', function () {
    $firstUser = User::factory()->create();

    $firstUser->wallets()->create(
        [
            'address' => '0x1231231231231231231231231231231231231231',
            'total_usd' => 0,
        ]
    );

    expect(User::count())->toBe(1);

    $wallets = $firstUser->wallets()->get();
    expect($wallets)->toHaveLength(1);

    $provider = new Web3UserProvider(User::class);
    $returnedUser = $provider->retrieveByCredentials([
        'chainId' => Chains::Mumbai->value,
        'timezone' => 'Europe/London',
        'address' => '0x1231231231231231231231231231231231231231',
    ]);

    expect($returnedUser->id)->toEqual($firstUser->id);

    $wallets = $firstUser->wallets()->get();
    expect($wallets)->toHaveLength(1);
});
