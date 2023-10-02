<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionOpenseaSlug as FetchCollectionOpenseaSlugJob;
use App\Models\Collection;
use DateTime;
use Illuminate\Console\Command;

class FetchCollectionOpenseaSlug extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = '     {--collection-id=}';

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
                FetchCollectionOpenseaSlugJob::dispatch(
                    collection: $collection,
                    retryUntil: $this->getRetryUntil()
                );
            },
            queryCallback: fn ($query) => $query
                // Does not have an opensea slug
                ->whereNull('extra_attributes->opensea_slug')
                // Has not been fetched
                ->whereNull('extra_attributes->opensea_slug_last_fetched_at'),
        );

        return Command::SUCCESS;
    }

    public function getRetryUntil(): DateTime
    {
        $total = Collection::query()
            ->whereNull('extra_attributes->opensea_slug')
            ->whereNull('extra_attributes->opensea_slug_last_fetched_at')
            ->count();

        $maxRequest = (int) config('services.opensea.rate.max_requests');
        $perSeconds = (int) config('services.opensea.rate.per_seconds');

        $secondsNeeded = (int) ceil($total / $maxRequest) * $perSeconds;

        return now()->addSeconds($secondsNeeded);
    }
}
