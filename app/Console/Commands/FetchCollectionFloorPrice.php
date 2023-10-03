<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionFloorPrice as FetchCollectionFloorPriceJob;
use Illuminate\Console\Command;

class FetchCollectionFloorPrice extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nfts:fetch-collection-floor-price {--collection-id=} {--limit=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the latest floor price for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $limit = $this->option('limit');

        $this->forEachCollection(
            callback: function ($collection) {
                FetchCollectionFloorPriceJob::dispatch(
                    chainId: $collection->network->chain_id,
                    address: $collection->address,
                );
            },
            queryCallback: function ($query) use ($limit) {
                $query
                    ->when(
                        $limit !== null,
                        fn ($q) => $q
                            ->orderByFloorPriceLastFetchedAt()
                            // So the price in update every hour
                            ->floorPriceNotFetchedInLastHour()
                    );
            },
            limit: $limit === null ? null : (int) $limit
        );

        return Command::SUCCESS;
    }
}
