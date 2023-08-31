<?php

declare(strict_types=1);

use App\Jobs\FetchTokens;
use App\Models\Wallet;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for active wallets', function () {
    Bus::fake();

    Wallet::factory()->count(3)->recentlyActive()->create();

    Wallet::factory()->count(2)->inactive()->create();

    Bus::assertDispatchedTimes(FetchTokens::class, 0);

    $this->artisan('wallets:fetch-tokens', [
        '--chain-id' => 1,
    ]);

    Bus::assertDispatchedTimes(FetchTokens::class, 3);
});

it('dispatches a job for online wallets', function () {
    Bus::fake();

    Wallet::factory()->count(3)->online()->create();

    Wallet::factory()->count(1)->recentlyActiveButNotOnline()->create();

    Wallet::factory()->count(1)->inactive()->create();

    Bus::assertDispatchedTimes(FetchTokens::class, 0);

    $this->artisan('wallets:fetch-tokens', [
        '--chain-id' => 1,
        '--only-online' => true,
    ]);

    Bus::assertDispatchedTimes(FetchTokens::class, 3);
});

it('dispatches a job for a specific wallet', function () {
    Bus::fake();

    $wallet = Wallet::factory()->create();

    Bus::assertDispatchedTimes(FetchTokens::class, 0);

    $this->artisan('wallets:fetch-tokens', [
        '--wallet-id' => $wallet->id,
        '--chain-id' => 1,
    ]);

    Bus::assertDispatchedTimes(FetchTokens::class, 1);
});
