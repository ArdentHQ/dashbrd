<?php

declare(strict_types=1);

use App\Jobs\RefreshWalletCollections;
use App\Models\Nft;
use App\Support\Facades\Signature;
use Illuminate\Support\Facades\Bus;

it('can get the indexing status', function () {
    $user = createUser(walletAttributes: [
        'last_activity_at' => now(),
        'onboarded_at' => now(),
        'is_refreshing_collections' => true,
    ]);

    Signature::setWalletIsSigned($user->wallet->id);

    $response = $this->actingAs($user)->getJson(route('refreshed-collections-status'));

    expect($response->json())->toBe([
        'indexing' => true,
    ]);

    $user->wallet->update([
        'is_refreshing_collections' => false,
    ]);

    $response = $this->actingAs($user)->getJson(route('refreshed-collections-status'));

    expect($response->json())->toBe([
        'indexing' => false,
    ]);
});

it('can dispatch jobs to refresh all collections for a wallet', function () {
    Bus::fake();

    $user = createUser(walletAttributes: [
        'last_activity_at' => now(),
        'onboarded_at' => now(),
    ]);

    Signature::setWalletIsSigned($user->wallet->id);

    Nft::factory()->for($user->wallet)->create();
    Nft::factory()->for($user->wallet)->create();

    $response = $this->actingAs($user)->post(route('refresh-collections'));

    $response->assertStatus(302);

    Bus::assertDispatched(RefreshWalletCollections::class, fn ($job) => $job->wallet->is($user->wallet));
});
