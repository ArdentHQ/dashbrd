<?php

use App\Console\Commands\FetchCollectionBannerBatch;
use App\Models\Collection;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for collections without banners', function () {
    Bus::fake();

    Collection::factory(3)->create();

    Collection::factory(2)->create([
        'extra_attributes' => [
            'banner' => 'https://example.com/image.png',
        ],
    ]);

    Bus::assertDispatchedTimes(FetchCollectionBannerBatch::class, 0);

    $this->artisan('nfts:fetch-collection-banner-batch', [
        '--missing-only' => true,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionBannerBatch::class, 3);
});

it('dispatches a job for collections', function () {
    Bus::fake();

    Collection::factory(3)->create();

    Bus::assertDispatchedTimes(FetchCollectionBannerBatch::class, 0);

    $this->artisan('nfts:fetch-collection-banner-batch');

    Bus::assertDispatchedTimes(FetchCollectionBannerBatch::class, 3);
});
