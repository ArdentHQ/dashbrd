<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionTotalVolume as FetchCollectionTotalVolumeJob;
use Illuminate\Console\Command;

class FetchCollectionTotalVolume extends Command
{
    use DependsOnOpenseaRateLimit, InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:fetch-total-volume {--collection-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the total volume for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->forEachCollection(function ($collection) {
            FetchCollectionTotalVolumeJob::dispatch($collection);
        });

        return Command::SUCCESS;
    }
}
