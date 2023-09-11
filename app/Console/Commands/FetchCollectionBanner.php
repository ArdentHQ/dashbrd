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
    protected $signature = 'nfts:fetch-collection-banner {--collection-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the latest banner for a collection';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (empty($this->option('collection-id'))) {
            $this->error('Collection ID is missing. Please either set `collection-id` flag or use `nfts:fetch-collection-banner-batch` command to fetch banner of multiple collections');
            return Command::INVALID;
        }

        $this->forEachCollection(function ($collection) {
            Job::dispatch($collection);
        });

        return Command::SUCCESS;
    }
}
