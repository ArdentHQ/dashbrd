<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionFloorPrice as FetchCollectionFloorPriceJob;
use App\Models\Collection;
use DateTime;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;

class FetchCollectionFloorPrice extends Command
{
    use InteractsWithCollections;

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
        $this->forEachCollection(function ($collection) {
            FetchCollectionFloorPriceJob::dispatch(
                chainId: $collection->network->chain_id,
                address: $collection->address,
                retryUntil: $this->getRetryUntil(),
            );
        });

        return Command::SUCCESS;
    }

    public function getRetryUntil(): DateTime
    {
        // Only opensea is rate limited
        if (Config::get('dashbrd.web3_providers.'.FetchCollectionFloorPriceJob::class) !== 'opensea') {
            return now()->addMinutes(30);
        }

        $total = Collection::withoutSpamContracts()->count();

        $maxRequest = (int) config('services.opensea.rate.max_requests');
        $perSeconds = (int) config('services.opensea.rate.per_seconds');

        $secondsNeeded = (int) ceil($total / $maxRequest) * $perSeconds;

        return now()->addSeconds($secondsNeeded);
    }
}
