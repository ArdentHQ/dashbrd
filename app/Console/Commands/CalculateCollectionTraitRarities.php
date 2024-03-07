<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\CalculateTraitRaritiesForCollection;
use Illuminate\Console\Command;

class CalculateCollectionTraitRarities extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:calculate-trait-rarities {--collection-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate the trait rarities for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $queryCallback = fn ($query) => $query->withAcceptableSupply();

        $this->forEachCollection(function ($collection) {
            CalculateTraitRaritiesForCollection::dispatch($collection);
        }, $queryCallback);

        return Command::SUCCESS;
    }
}
