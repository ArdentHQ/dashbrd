<?php

declare(strict_types=1);

use App\Enums\Chain;
use App\Jobs\FetchNativeBalances;
use App\Jobs\FetchTokens;
use Illuminate\Support\Facades\Bus;

it('calls the the fetch native balances job and fetch tokens job for user wallet', function () {
    Bus::fake([FetchTokens::class, FetchNativeBalances::class]);

    $user = createUser();

    $this->actingAs($user)
        ->post(route('transaction-success', [
            'chainId' => Chain::Polygon,
        ]))
        ->assertSuccessful();

    Bus::assertDispatched(FetchNativeBalances::class);

    Bus::assertDispatched(FetchTokens::class);
});
