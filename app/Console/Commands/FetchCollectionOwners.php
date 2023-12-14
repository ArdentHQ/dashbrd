<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionOwners as FetchCollectionOwnersJob;
use Illuminate\Console\Command;

class FetchCollectionOwners extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:fetch-owners {--collection-id=}';

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
        $this->forEachCollection(function ($collection) {
            FetchCollectionOwnersJob::dispatch($collection);
        });

        return Command::SUCCESS;
    }
}
