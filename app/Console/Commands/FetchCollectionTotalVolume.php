<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionTotalVolume as FetchCollectionTotalVolumeJob;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

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
        $queryCallback = fn (Builder $query) => $query->whereNotNull('extra_attributes->opensea_slug');

        $this->forEachCollection(function ($collection) {
            FetchCollectionTotalVolumeJob::dispatch($collection);
        }, queryCallback: $queryCallback);

        return Command::SUCCESS;
    }
}
