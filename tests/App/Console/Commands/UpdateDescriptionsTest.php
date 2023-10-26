<?php

declare(strict_types=1);

use App\Jobs\UpdateNftDescription;
use App\Models\Network;
use Illuminate\Support\Facades\Bus;

it('dispatches onto the queue', function () {
    Bus::fake();

    $network = Network::factory()->create();

    $this->artisan('nfts:update-descriptions', [
        '--start' => 10,
        '--network' => $network->id,
    ]);

    Bus::assertDispatched(UpdateNftDescription::class, function ($job) use ($network) {
        return $job->network->is($network) && $job->startId === 10;
    });
});

it('does not dispatch onto the queue if network does not exist', function () {
    Bus::fake();

    $this->artisan('nfts:update-descriptions', [
        '--start' => 10,
        '--network' => 10000,
    ]);

    Bus::assertNothingDispatched();
});
