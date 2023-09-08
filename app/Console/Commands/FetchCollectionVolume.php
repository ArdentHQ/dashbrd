<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionVolume as Job;
use Illuminate\Console\Command;

class FetchCollectionVolume extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nfts:fetch-collection-volume {--collection-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the volume for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->forEachCollection(static function ($collection) {
            Job::dispatch($collection);
        });

        return Command::SUCCESS;
    }
}
