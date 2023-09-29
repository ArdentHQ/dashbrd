<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionOpenseaSlug as FetchCollectionOpenseaSlugJob;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

class FetchCollectionOpenseaSlug extends Command
{
    use InteractsWithCollections;

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
        $this->forEachCollection(
            callback: function ($collection) {
                FetchCollectionOpenseaSlugJob::dispatch($collection);
            },
            queryCallback: fn (Builder $query) => $query
                // Does not have an opensea slug
                ->whereNull('extra_attributes->opensea_slug')
                // Has not been fetched
                ->whereNull('extra_attributes->opensea_slug_last_fetched_at'),
        );

        return Command::SUCCESS;
    }
}
