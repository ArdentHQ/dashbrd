<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionBanner as Job;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

class FetchCollectionBanner extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nfts:fetch-collection-banner {--collection-id=} {--missing-only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the latest banner for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $queryCallback = function (Builder $query): Builder {
            return $this->option('missing-only')
                        ? $query->whereNull('extra_attributes->banner')
                        : $query;
        };

        $this->forEachCollection(function ($collection) {
            Job::dispatch($collection);
        }, $queryCallback);

        return Command::SUCCESS;
    }
}
