<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionVolumeHistory as FetchCollectionVolumeHistoryJob;
use Illuminate\Console\Command;

class FetchCollectionVolumeHistory extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:fetch-volume-history {--collection-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the 30-day volume history for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->forEachCollection(function ($collection) {
            FetchCollectionVolumeHistoryJob::dispatch($collection);
        });

        return Command::SUCCESS;
    }
}
