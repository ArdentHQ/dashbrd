<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionBanner;
use App\Models\Collection;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionBanner::class, 0);

    $this->artisan('nfts:fetch-collection-banner', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionBanner::class, 1);
});

it('should return error if `collection-id` flag is missing', function () {
    Bus::fake();

    $response = $this->artisan('nfts:fetch-collection-banner');

    $response->assertExitCode(Command::INVALID);

    Bus::assertDispatchedTimes(FetchCollectionBanner::class, 0);
});
