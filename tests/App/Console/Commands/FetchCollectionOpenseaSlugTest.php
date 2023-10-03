<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionOpenseaSlug;
use App\Models\Collection;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for collections without opensea slug or fetched date', function () {
    Bus::fake();

    Collection::factory()->create()->id;

    Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug' => 'testy',
            'opensea_slug_last_fetched_at' => now()->subDay(),
        ],
    ]);
    Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug' => 'testy',
        ],
    ]);

    Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug_last_fetched_at' => now()->subDay(),
        ],
    ]);

    Collection::factory()->create()->id;

    Bus::assertDispatchedTimes(FetchCollectionOpenseaSlug::class, 0);

    $this->artisan('nfts:fetch-collection-opensea-slug');

    Bus::assertDispatchedTimes(FetchCollectionOpenseaSlug::class, 2);
});

it('dispatches a job for collections without opensea slug or fetched date using a limit', function () {
    Bus::fake();

    Collection::factory()->create()->id;

    Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug' => 'testy',
            'opensea_slug_last_fetched_at' => now()->subDay(),
        ],
    ]);
    Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug' => 'testy',
        ],
    ]);

    Collection::factory()->create([
        'extra_attributes' => [
            'opensea_slug_last_fetched_at' => now()->subDay(),
        ],
    ]);

    Collection::factory()->create()->id;

    Bus::assertDispatchedTimes(FetchCollectionOpenseaSlug::class, 0);

    $this->artisan('nfts:fetch-collection-opensea-slug', [
        '--limit' => '1',
    ]);

    Bus::assertDispatchedTimes(FetchCollectionOpenseaSlug::class, 1);
});

it('dispatches a job for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionOpenseaSlug::class, 0);

    $this->artisan('nfts:fetch-collection-opensea-slug', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionOpenseaSlug::class, 1);
});
