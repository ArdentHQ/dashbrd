<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionFloorPrice as FetchCollectionFloorPriceJob;
use Illuminate\Console\Command;

class FetchCollectionFloorPrice extends Command
{
    use DependsOnOpenseaRateLimit, InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:fetch-floor-price {--collection-id=}';

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
        $usesOpensea = $this->usesOpensea(FetchCollectionFloorPriceJob::class);

        // Job runs every hour (60 minutes)
        $limit = $usesOpensea ? $this->getLimitPerMinutes(60) : null;

        $this->forEachCollection(
            callback: function ($collection, $index) {
                $this->dispatchDelayed(
                    callback: fn () => FetchCollectionFloorPriceJob::dispatchSync(
                        chainId: $collection->network->chain_id,
                        address: $collection->address,
                    ),
                    index: $index,
                    job: FetchCollectionFloorPriceJob::class,
                );
            },
            queryCallback: function ($query) use ($limit) {
                return $query
                    ->when(
                        $limit !== null,
                        fn ($q) => $q->orderByFloorPriceLastFetchedAt()
                    );
            },
            limit: $limit === null ? null : (int) $limit
        );

        return Command::SUCCESS;
    }
}
