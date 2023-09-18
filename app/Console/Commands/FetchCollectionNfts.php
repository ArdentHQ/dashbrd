<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionNfts as FetchCollectionNftsJob;
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
        $this->forEachCollection(function ($collection) {
            FetchCollectionNftsJob::dispatch(
                $collection,
                    $this->option('start-token') ?? $collection->last_indexed_token_number
            );
        });

        return Command::SUCCESS;
    }
}
