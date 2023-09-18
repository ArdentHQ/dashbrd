<?php

declare(strict_types=1);

use App\Jobs\FetchNativeBalances;
use App\Models\Wallet;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for active wallets', function () {
    Bus::fake();

    Wallet::factory()->count(3)->recentlyActive()->create();

    Wallet::factory()->count(2)->inactive()->create();

    Bus::assertDispatchedTimes(FetchNativeBalances::class, 0);

    $this->artisan('wallets:fetch-native-balances', [
        '--chain-id' => 1,
    ]);

    Bus::assertDispatchedTimes(FetchNativeBalances::class, 1);
});

it('dispatches a job for online wallets', function () {
    Bus::fake();

    Wallet::factory()->count(3)->online()->create();

    Wallet::factory()->count(1)->recentlyActiveButNotOnline()->create();

    Wallet::factory()->count(1)->inactive()->create();

    Bus::assertDispatchedTimes(FetchNativeBalances::class, 0);

    $this->artisan('wallets:fetch-native-balances', [
        '--chain-id' => 1,
        '--only-online' => true,
    ]);

    Bus::assertDispatchedTimes(FetchNativeBalances::class, 1);
});

it('dispatches native balances job for mainnet networks if chain id is not provided', function () {
    app()->detectEnvironment(function () {
        return 'production';
    });

    Bus::fake();

    Wallet::factory()->count(3)->recentlyActive()->create();

    Wallet::factory()->count(2)->inactive()->create();

    Bus::assertDispatchedTimes(FetchNativeBalances::class, 0);

    $this->artisan('wallets:fetch-native-balances');

    Bus::assertDispatchedTimes(FetchNativeBalances::class, 2);
});

it('dispatches a job for a specific wallet', function () {
    Bus::fake();

    $wallet = Wallet::factory()->create();

    Bus::assertDispatchedTimes(FetchNativeBalances::class, 0);

    $this->artisan('wallets:fetch-native-balances', [
        '--wallet-id' => $wallet->id,
        '--chain-id' => 1,
    ]);

    Bus::assertDispatchedTimes(FetchNativeBalances::class, 1);
});
