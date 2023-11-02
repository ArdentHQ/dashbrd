<?php

declare(strict_types=1);

use App\Jobs\RefreshWalletCollections;
use App\Models\Nft;
use Illuminate\Support\Facades\Bus;

it('can dispatch jobs to refresh all collections for a wallet', function () {
    Bus::fake();

    $user = createUser(walletAttributes: [
        'last_activity_at' => now(),
        'onboarded_at' => now(),
    ]);

    Nft::factory()->for($user->wallet)->create();
    Nft::factory()->for($user->wallet)->create();

    $response = $this->actingAs($user)->postJson(route('refresh-collections'));

    $response->assertStatus(200);

    Bus::assertDispatched(RefreshWalletCollections::class, fn ($job) => $job->wallet->is($user->wallet));
});
