<?php

declare(strict_types=1);

use App\Enums\Chain;
use App\Jobs\FetchUserNfts;
use App\Jobs\FetchWalletNfts;
use App\Models\Network;
use App\Models\User;
use Illuminate\Support\Facades\Bus;

it('should dispatch FetchWalletNfts jobs for user', function () {
    Bus::fake();
    Bus::assertDispatchedTimes(FetchWalletNfts::class, 0);

    $user = User::factory()->create();
    $address = '0x1234567890123456789012345678901234567890';

    $network = Network::where('chain_id', Chain::ETH->value)->firstOrFail();

    $user->wallets()->createMany([
        ['address' => $address, 'total_usd' => 0],
    ]);

    (new FetchUserNfts($user->id, $network))->handle();

    Bus::assertDispatchedTimes(FetchWalletNfts::class, 1);
});

it('should use the user id as a unique job identifier', function () {
    $user = User::factory()->create();

    $network = Network::where('chain_id', Chain::ETH->value)->firstOrFail();

    expect((new FetchUserNfts($user->id, $network))->uniqueId())->toBeString();
});
