<?php

declare(strict_types=1);

use App\Events\WalletBecameActive;
use App\Models\Wallet;
use Illuminate\Support\Facades\Bus;

it('should dispatch the fetch ens details job when a wallet became active', function () {
    event(new WalletBecameActive(Wallet::factory()->create()));

    Bus::assertBatched(fn ($batch) => $batch->jobs->count() > 0);
});
