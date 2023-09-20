<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionMetadataJob;
use App\Models\Collection;
use App\Models\Network;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for collections', closure: function () {
    Bus::fake();

    $network = Network::factory()->create();

    Collection::factory(3)->create(['network_id' => $network->id]);

    Bus::assertDispatchedTimes(FetchCollectionMetadataJob::class, 0);

    $this->artisan('nfts:fetch-collection-metadata');

    Bus::assertDispatchedTimes(FetchCollectionMetadataJob::class, 1);
});
