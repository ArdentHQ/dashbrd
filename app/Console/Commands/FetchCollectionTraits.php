<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionTraits as FetchCollectionTraitsJob;
use Illuminate\Console\Command;

class FetchCollectionTraits extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nfts:fetch-collection-traits {--collection-id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the latest traits for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->forEachCollection(function ($collection) {
            FetchCollectionTraitsJob::dispatch($collection);
        });

        return Command::SUCCESS;
    }
}
