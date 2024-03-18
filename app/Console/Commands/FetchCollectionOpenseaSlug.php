<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionOpenseaSlug as FetchCollectionOpenseaSlugJob;
use Illuminate\Console\Command;

class FetchCollectionOpenseaSlug extends Command
{
    use DependsOnOpenseaRateLimit, InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:fetch-opensea-slug {--collection-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the OpenSea slug for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Job runs every 5 minutes
        $limit = $this->getLimitPerMinutes(5);

        // We only care about collections that don't have a slug yet, so in most cases it will not run any request...
        $this->forEachCollection(
            callback: function ($collection, $index) {
                $this->dispatchDelayed(
                    callback: fn () => FetchCollectionOpenseaSlugJob::dispatch($collection),
                    index: $index,
                    job: FetchCollectionOpenseaSlugJob::class,
                );
            },
            queryCallback: fn ($query) => $query
                ->orderByOpenseaSlugLastFetchedAt()
                ->whereNull('extra_attributes->opensea_slug')
                ->whereNull('extra_attributes->opensea_slug_last_fetched_at'),
            limit: $limit
        );

        return Command::SUCCESS;
    }
}
