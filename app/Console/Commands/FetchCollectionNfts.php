<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionNfts as FetchCollectionNftsJob;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

class FetchCollectionNfts extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:fetch-nfts {--collection-id=} {--start-token=} {--only-signed} {--limit=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch all NFTs for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $onlySigned = (bool) $this->option('only-signed');

        $limit = $this->option('limit');

        $this->forEachCollection(
            callback: function ($collection) {
                if (! $collection->isBlacklisted()) {
                    FetchCollectionNftsJob::dispatch(
                        $collection,
                        $this->option('start-token') ?? $collection->last_indexed_token_number,
                        skipIfPotentiallyFull: true,
                    );
                }
            },
            queryCallback: function (Builder $query) use ($onlySigned, $limit) {
                return $query
                    ->when($onlySigned, fn ($q) => $q->withSignedWallets())
                    ->when($limit !== null, fn ($q) => $q->orderByOldestNftLastFetchedAt())
                    ->withAcceptableSupply();
            },
            limit: $limit === null ? null : (int) $limit
        );

        return Command::SUCCESS;
    }
}
