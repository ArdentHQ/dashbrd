<?php

declare(strict_types=1);

use App\Data\NetworkData;
use App\Enums\Chains;
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

    $networkData = NetworkData::from(Network::where('chain_id', Chains::ETH->value)->firstOrFail());

    $user->wallets()->createMany([
        ['address' => $address, 'total_usd' => 0],
    ]);

    (new FetchUserNfts($user->id, $networkData))->handle();

    Bus::assertDispatchedTimes(FetchWalletNfts::class, 1);
});

it('should use the user id as a unique job identifier', function () {
    $user = User::factory()->create();

    $networkData = NetworkData::from(Network::where('chain_id', Chains::ETH->value)->firstOrFail());

    expect((new FetchUserNfts($user->id, $networkData))->uniqueId())->toBeString();
});
