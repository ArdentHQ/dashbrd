<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionOwners as Job;
use Illuminate\Console\Command;

class FetchCollectionOwners extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nfts:fetch-collection-owners {--collection-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the owners for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->forEachCollection(
            callback: function ($collection) {
                Job::dispatch($collection);
            },
            getLogData: fn ($collections) => [
                'Dispatching FetchCollectionOwners Job', [
                    'collection_addresses' => $collections->pluck('address')->toArray(),
                ],
            ]
        );

        return Command::SUCCESS;
    }
}
