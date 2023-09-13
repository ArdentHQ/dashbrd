<?php

declare(strict_types=1);

use App\Jobs\FetchUserNfts;
use App\Models\Gallery;
use Carbon\Carbon;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for all users that own at least one gallery and werent recently active', function () {
    Bus::fake();

    $inactiveUserWithGallery = createUser();

    $activeUserWithGallery = createUser();
    $activeUserWithGallery->wallet->update([
        'last_activity_at' => Carbon::now(),
    ]);

    $userWithoutGallery = createUser();
    $activeUserWithoutGallery = createUser();
    $activeUserWithoutGallery->wallet->update([
        'last_activity_at' => Carbon::now(),
    ]);

    Gallery::factory()->create([
        'user_id' => $inactiveUserWithGallery->id,
    ]);

    Gallery::factory()->create([
        'user_id' => $activeUserWithGallery->id,
    ]);

    Bus::assertDispatchedTimes(FetchUserNfts::class, 0);

    $this->artisan('wallets:maintain-galleries', [
        '--chain-id' => 1,
    ]);

    Bus::assertDispatchedTimes(FetchUserNfts::class, 1);
});

it('dispatches a job for a specific user', function () {
    Bus::fake();

    $user = createUser();
    Gallery::factory()->create([
        'user_id' => $user,
    ]);
    Bus::assertDispatchedTimes(FetchUserNfts::class, 0);

    $this->artisan('wallets:maintain-galleries', [
        '--user-id' => $user->id,
        '--chain-id' => 1,
    ]);

    Bus::assertDispatchedTimes(FetchUserNfts::class, 1);
});
