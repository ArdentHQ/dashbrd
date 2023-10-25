<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionActivity as Job;
use App\Models\Collection;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

class FetchCollectionActivity extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:fetch-activity {--collection-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch collection activity for all collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (! config('dashbrd.features.activities')) {
            return Command::SUCCESS;
        }

        // Modify the query to only fetch activities for collections that we index NFTs for...
        $queryCallback = function (Builder $query) {
            /** @var Builder<Collection> */
            return $query->where('is_fetching_activity', false)
                        ->whereNotNull('supply')
                        ->where('supply', '<=', config('dashbrd.collections_max_cap'));
        };

        $this->forEachCollection(function ($collection) {
            Job::dispatch($collection, forced: true);
        }, $queryCallback);

        return Command::SUCCESS;
    }
}
