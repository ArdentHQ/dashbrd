<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionNfts as Job;
use Illuminate\Console\Command;

class FetchCollectionNfts extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:fetch-nfts {--collection-id=} {--start-token=}';

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
        $startToken = $this->option('start-token');

        $this->forEachCollection(
            callback: function ($collection) use ($startToken) {
                Job::dispatch($collection, $startToken ?? $collection->last_indexed_token_number);
            },
            getLogData: fn ($collections) => [
                'Dispatching FetchCollectionNfts Job', [
                    'collection_addresses' => $collections->pluck('address')->toArray(),
                    'start_token' => $startToken,
                ],
            ]
        );

        return Command::SUCCESS;
    }
}
