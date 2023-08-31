<?php

declare(strict_types=1);

use App\Jobs\FetchUserNfts;
use App\Models\Gallery;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for all users that own at least one gallery', function () {
    Bus::fake();

    $user = createUser();
    Gallery::factory()->create([
        'user_id' => $user,
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
