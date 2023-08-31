<?php

declare(strict_types=1);

use App\Jobs\FetchEnsDetails;
use App\Models\Wallet;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for active wallets', function () {
    Bus::fake();

    Wallet::factory()->count(3)->recentlyActive()->create();

    Wallet::factory()->count(2)->inactive()->create();

    Bus::assertDispatchedTimes(FetchEnsDetails::class, 0);

    $this->artisan('wallets:fetch-ens-details');

    Bus::assertDispatchedTimes(FetchEnsDetails::class, 3);
});

it('dispatches a job for a specific wallet', function () {
    Bus::fake();

    $wallet = Wallet::factory()->create();

    Bus::assertDispatchedTimes(FetchEnsDetails::class, 0);

    $this->artisan('wallets:fetch-ens-details', [
        '--wallet-id' => $wallet->id,
    ]);

    Bus::assertDispatchedTimes(FetchEnsDetails::class, 1);
});
