<?php

declare(strict_types=1);

use App\Models\Network;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Validation\ValidationException;
use Tests\Stubs\UpdatesPrimaryWalletStub;

it('should update primary wallet of user', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['address' => '0x1231231231231231231231231231231231231231']);

    $user->wallet_id = $wallet->id;
    $user->save();

    $network = Network::polygon()->firstOrFail();
    $newWallet = Wallet::factory()->create([
        'address' => '0x0000000000000000000000000000000000001010',
    ]);

    $stubClass = new UpdatesPrimaryWalletStub(
        address: '0x0000000000000000000000000000000000001010',
        chainId: 137,
        user: $user,
    );

    expect($user->fresh()->wallet_id)->toBe($wallet->id);

    $stubClass->updatePrimaryWallet();

    expect($user->fresh()->wallet_id)->toBe($newWallet->id);
});

it('should throw exception if invalid credentials', function () {
    $user = User::factory()->create();
    $network1 = Network::factory()->create(['chain_id' => 4]);
    $wallet = Wallet::factory()->create([
        'address' => '0x1231231231231231231231231231231231231231',
    ]);

    $user->wallet_id = $wallet->id;
    $user->save();

    $network2 = Network::polygon()->firstOrFail();
    $newWallet = Wallet::factory()->create([
        'address' => '0x0000000000000000000000000000000000001010',
    ]);

    $stubClass = new UpdatesPrimaryWalletStub(
        address: '0x0000000000000000000000000000000000001013',
        chainId: 10, // unknown chain id
        user: $user,
    );

    expect($user->fresh()->wallet_id)->toBe($wallet->id);

    expect(fn () => $stubClass->updatePrimaryWallet())->toThrow(ValidationException::class);

    expect($user->fresh()->wallet_id)->toBe($wallet->id);
});
