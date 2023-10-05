<?php

declare(strict_types=1);

use App\Models\Nft;
use App\Support\Facades\Signature;
use Illuminate\Bus\PendingBatch;
use Illuminate\Support\Facades\Bus;

it('can dispatch jobs to refresh all collections for a wallet', function () {
    Bus::fake();

    $user = createUser(walletAttributes: [
        'last_activity_at' => now(),
        'onboarded_at' => now(),
    ]);

    Signature::setWalletIsSigned($user->wallet->id);

    $nft = Nft::factory()->for($user->wallet)->create();
    $other = Nft::factory()->for($user->wallet)->create();

    $response = $this->actingAs($user)->post('/refreshed-collections');

    $response->assertStatus(302);

    Bus::assertBatched(function (PendingBatch $batch) {
        return $batch->jobs->count() === 8;
    });

    $user->wallet->refresh();

    expect($user->wallet->is_refreshing_collections)->toBeTrue();
    expect($user->wallet->refreshed_collections_at)->toBeNull();

    Bus::assertBatched(function ($batch) use ($user) {
        /* @var \Illuminate\Queue\SerializableClosure $callback */
        [$callback] = $batch->finallyCallbacks();

        $callback->getClosure()->call($this);

        $user->wallet->refresh();

        expect($user->wallet->is_refreshing_collections)->toBeFalse();
        expect($user->wallet->refreshed_collections_at)->not->toBeNull();

        return true;
    });
});
