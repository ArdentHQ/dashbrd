<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionBannerBatch;
use App\Models\Collection;
use App\Models\Network;
use App\Models\SpamContract;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Config;

it('dispatches a job for collections without banners', function () {
    Bus::fake();

    $networks = Network::factory()->createMany(2);

    Collection::factory(3)->create(['network_id' => $networks[0]->id]);
    Collection::factory(2)->create(['network_id' => $networks[1]->id]);

    Collection::factory(2)->create([
        'network_id' => $networks[0]->id,
        'extra_attributes' => [
            'banner' => 'https://example.com/image.png',
        ],
    ]);

    Bus::assertDispatchedTimes(FetchCollectionBannerBatch::class, 0);

    $this->artisan('nfts:fetch-collection-banner-batch', [
        '--missing-only' => true,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionBannerBatch::class, 2);
});

it('should exclude spam contracts', function () {
    Bus::fake();

    $network = Network::factory()->create();

    $collections = Collection::factory(2)->create(['network_id' => $network->id]);

    SpamContract::query()->insert([
        'address' => $collections->first()->address,
        'network_id' => $collections->first()->network_id,
    ]);

    Bus::assertDispatchedTimes(FetchCollectionBannerBatch::class, 0);

    $this->artisan('nfts:fetch-collection-banner-batch');

    Bus::assertDispatched(FetchCollectionBannerBatch::class, function ($job) use ($collections) {
        return ! in_array($collections->first()->address, $job->collectionAddresses);
    });
});

it('dispatches a job for collections', function () {
    Bus::fake();

    $network = Network::factory()->create();

    Collection::factory(3)->create(['network_id' => $network->id]);

    Bus::assertDispatchedTimes(FetchCollectionBannerBatch::class, 0);

    $this->artisan('nfts:fetch-collection-banner-batch');

    Bus::assertDispatchedTimes(FetchCollectionBannerBatch::class, 1);
});
