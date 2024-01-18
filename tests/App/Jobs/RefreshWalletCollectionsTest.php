<?php

declare(strict_types=1);

use App\Jobs\RefreshWalletCollections;
use App\Models\Nft;
use App\Models\Wallet;
use Illuminate\Bus\PendingBatch;
use Illuminate\Support\Facades\Bus;

it('can dispatch batch of jobs to refresh collections', function () {
    Bus::fake();

    $user = createUser(walletAttributes: [
        'last_activity_at' => now(),
        'onboarded_at' => now(),
    ]);

    $nft = Nft::factory()->for($user->wallet)->create();
    $other = Nft::factory()->for($user->wallet)->create();

    $job = new RefreshWalletCollections($user->wallet);

    $job->handle();

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

it('has a retry until', function () {
    $job = new RefreshWalletCollections(Wallet::factory()->create());

    expect($job->retryUntil())->toBeInstanceOf(DateTime::class);
});

it('has a unique ID', function () {
    $job = new RefreshWalletCollections(Wallet::factory()->create());

    expect($job->uniqueId())->toBeString();
});

it('has middleware', function () {
    $job = new RefreshWalletCollections(Wallet::factory()->create());

    expect($job->middleware())->toBeArray();
});
