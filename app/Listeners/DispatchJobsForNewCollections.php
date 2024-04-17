<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Enums\Chain;
use App\Events\CollectionSaved;
use App\Jobs\DetermineCollectionMintingDate;
use App\Jobs\FetchCollectionActivity;
use App\Jobs\FetchCollectionFloorPrice;
use App\Jobs\FetchCollectionSupplyFromOpenSea;
use App\Jobs\FetchCollectionVolumeHistory;
use App\Support\Queues;

class DispatchJobsForNewCollections
{
    /**
     * Handle the event.
     */
    public function handle(CollectionSaved $event): void
    {
        $collection = $event->collection;

        if ($collection->minted_at === null) {
            DetermineCollectionMintingDate::dispatch($collection);
        }

        $isPolygon = Chain::from($event->chainId)->isPolygon();

        if (! $isPolygon && ! $collection->is_fetching_activity && $collection->activity_updated_at === null) {
            FetchCollectionActivity::dispatch($collection)->onQueue(Queues::NFTS);
        }

        if ($collection->floor_price === null || $collection->floor_price === '') {
            FetchCollectionFloorPrice::dispatch($event->chainId, $collection->address)->onQueue(Queues::NFTS);
        }

        // If the collection has just been created, pre-fetch the 30-day volume history...
        if (! $isPolygon && $event->collection->volumes()->count() === 0) {
            FetchCollectionVolumeHistory::dispatch($collection);
        }

        // If the collection doesn't have any supply data, try to get the supply from OpenSea...
        if ($collection->supply === null && $collection->openSeaSlug() !== null) {
            FetchCollectionSupplyFromOpenSea::dispatch($collection);
        }
    }
}
