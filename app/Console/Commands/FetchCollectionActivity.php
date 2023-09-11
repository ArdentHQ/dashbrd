<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionActivity as Job;
use Illuminate\Console\Command;

class FetchCollectionActivity extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nfts:fetch-collection-activity {--collection-id=}';

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
        $this->forEachCollection(function ($collection) {
            Job::dispatch($collection);
        }, queryCallback: fn ($q) => $q->where('is_fetching_activity', false));

        return Command::SUCCESS;
    }
}
