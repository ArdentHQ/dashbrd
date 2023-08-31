<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionBanner;
use App\Models\Collection;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for collections', function () {
    Bus::fake();

    Collection::factory(3)->create();

    Bus::assertDispatchedTimes(FetchCollectionBanner::class, 0);

    $this->artisan('nfts:fetch-collection-banner');

    Bus::assertDispatchedTimes(FetchCollectionBanner::class, 3);
});

it('dispatches a job for collections without banners', function () {
    Bus::fake();

    Collection::factory(3)->create();

    Collection::factory(2)->create([
        'extra_attributes' => [
            'banner' => 'https://example.com/image.png',
        ],
    ]);

    Bus::assertDispatchedTimes(FetchCollectionBanner::class, 0);

    $this->artisan('nfts:fetch-collection-banner', [
        '--missing-only' => true,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionBanner::class, 3);
});

it('dispatches a job for a specific collection', function () {
    Bus::fake();

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(FetchCollectionBanner::class, 0);

    $this->artisan('nfts:fetch-collection-banner', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionBanner::class, 1);
});
