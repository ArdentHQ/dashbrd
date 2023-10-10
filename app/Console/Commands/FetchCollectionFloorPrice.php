<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionFloorPrice as FetchCollectionFloorPriceJob;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;

class FetchCollectionFloorPrice extends Command
{
    use InteractsWithCollections;

    /**
     * The factor to multiply the delay by to leave some room for other tasks.
     */
    const REQUEST_LIMIT_FACTOR = 3;

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
        $usesOpensea = $this->usesOpensea();

        $limit = $usesOpensea ? $this->getLimit() : null;

        $this->forEachCollection(
            callback: function ($collection, $index) use ($usesOpensea) {
                $delay = $usesOpensea ? Carbon::now()->addSeconds($this->getDelayInSeconds($index)) : null;

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

    private function usesOpensea(): bool
    {
        return Config::get('dashbrd.web3_providers.'.FetchCollectionFloorPriceJob::class) === 'opensea';
    }

    private function getDelayInSeconds(int $index): int
    {
        $maxRequests = config('services.opensea.rate.max_requests');

        $perSeconds = config('services.opensea.rate.per_seconds');

        return (int) floor($index / $maxRequests) * $perSeconds * self::REQUEST_LIMIT_FACTOR;
    }

    private function getLimit(): int
    {
        $maxRequests = config('services.opensea.rate.max_requests');

        $perSeconds = config('services.opensea.rate.per_seconds');

        $requestsPerHour = $maxRequests * 60 * 60 / $perSeconds;

        // limit to the requests per hour to leave some room for other tasks
        return (int) floor($requestsPerHour / self::REQUEST_LIMIT_FACTOR);
    }
}
