<?php

declare(strict_types=1);

use App\Jobs\FetchNftActivity;
use App\Models\Nft;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for owned nfts', function () {
    Bus::fake();

    Nft::factory()->count(3)->create();

    Nft::factory()->count(1)->create([
        'wallet_id' => null,
    ]);

    Bus::assertDispatchedTimes(FetchNftActivity::class, 0);

    $this->artisan('nfts:fetch-activity');

    Bus::assertDispatchedTimes(FetchNftActivity::class, 3);
});

it('dispatches a job for a specific nft', function () {
    Bus::fake();

    Nft::factory()->count(3)->create();

    $nft = Nft::factory()->create();

    Bus::assertDispatchedTimes(FetchNftActivity::class, 0);

    $this->artisan('nfts:fetch-activity', [
        '--nft-id' => $nft->id,
    ]);

    Bus::assertDispatchedTimes(FetchNftActivity::class, 1);
});
