<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionFloorPrice as FetchCollectionFloorPriceJob;
use Carbon\Carbon;
use Illuminate\Console\Command;

class FetchCollectionFloorPrice extends Command
{
    use HasOpenseaRateLimit, InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nfts:fetch-collection-floor-price {--collection-id=}';

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

        $limit = $usesOpensea ? $this->getLimitPerHour() : null;

        $this->forEachCollection(
            callback: function ($collection, $index) use ($usesOpensea) {
                $delay = $usesOpensea
                    ? Carbon::now()->addSeconds(
                        $this->getDelayInSeconds(FetchCollectionFloorPriceJob::class, $index)
                    )
                    : null;

                FetchCollectionFloorPriceJob::dispatch(
                    chainId: $collection->network->chain_id,
                    address: $collection->address,
                )->delay($delay);
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
