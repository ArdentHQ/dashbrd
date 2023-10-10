<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionOpenseaSlug as FetchCollectionOpenseaSlugJob;
use Carbon\Carbon;
use Illuminate\Console\Command;

class FetchCollectionOpenseaSlug extends Command
{
    use HasOpenseaRateLimit, InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nfts:fetch-collection-opensea-slug {--collection-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the opensea slug for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $limit = $this->getLimitPerHour();

        $this->forEachCollection(
            callback: function ($collection, $index) {
                $delayInSeconds = $this->getDelayInSeconds(FetchCollectionOpenseaSlugJob::class, $index);

                $delay = Carbon::now()->addSeconds($delayInSeconds);

                FetchCollectionOpenseaSlugJob::dispatch($collection)
                    ->delay($delay);
            },
            queryCallback: fn ($query) => $query
                ->orderByOpenseaSlugLastFetchedAt()
                // Does not have an opensea slug
                ->whereNull('extra_attributes->opensea_slug')
                // Has not been fetched
                ->whereNull('extra_attributes->opensea_slug_last_fetched_at'),
            limit: $limit
        );

        return Command::SUCCESS;
    }
}
