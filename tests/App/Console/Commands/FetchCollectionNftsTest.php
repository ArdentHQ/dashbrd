<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionNfts;
use App\Models\Collection;
use App\Models\SpamContract;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for all collections', function () {
    Bus::fake();

    Collection::factory()->count(3)->create();

    Bus::assertDispatchedTimes(FetchCollectionNfts::class, 0);

    $this->artisan('collections:fetch-nfts');

    Bus::assertDispatchedTimes(FetchCollectionNfts::class, 3);
});

it('dispatches a job for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionNfts::class, 0);

    $this->artisan('collections:fetch-nfts', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionNfts::class, 1);
});

it('uses the start token from the option', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionNfts::class, 0);

    $this->artisan('collections:fetch-nfts', [
        '--collection-id' => $collection->id,
        '--start-token' => '0x1234',
    ]);

    Bus::assertDispatched(FetchCollectionNfts::class, fn ($job) => $job->startToken === '0x1234');
});

it('uses the start token from the collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create([
        'last_indexed_token_number' => null,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionNfts::class, 0);

    $this->artisan('collections:fetch-nfts', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatched(FetchCollectionNfts::class, fn ($job) => $job->startToken === null);

    $collection = Collection::factory()->create([
        'last_indexed_token_number' => '1000',
    ]);

    $this->artisan('collections:fetch-nfts', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatched(FetchCollectionNfts::class, fn ($job) => $job->startToken === '1000');
});

it('dispatches multiple jobs in chunks for non-spam collections', function () {
    Bus::fake();

    $collections = Collection::factory()->count(102)->create();

    SpamContract::query()->insert([
        'address' => $collections->first()->address,
        'network_id' => $collections->first()->network_id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionNfts::class, 0);

    $this->artisan('collections:fetch-nfts');

    Bus::assertDispatchedTimes(FetchCollectionNfts::class, 101);
});
