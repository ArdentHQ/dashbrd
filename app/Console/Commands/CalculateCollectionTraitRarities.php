<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\CalculateTraitRaritiesForCollection;
use App\Models\Collection;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Bus;

class CalculateCollectionTraitRarities extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:calculate-trait-rarities {--start=} {--limit=} {--offset=} {--collection-id=}';

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
        $start = $this->option('start');
        $limit = $this->option('limit');

        if ($start !== null) {
            $collections = Collection::query()
                                    ->withAcceptableSupply()
                                    ->select('collections.*')
                                    ->withoutSpamContracts()
                                    ->where('id', '>=', (int) $start)
                                    ->when($limit !== null, fn ($q) => $q->limit((int) $limit))
                                    ->orderBy('id', 'asc')
                                    ->get();

            $first = $collections->first();
            $last = $collections->last();

            Bus::batch($collections->mapInto(CalculateTraitRaritiesForCollection::class))
                    ->name('Calculating rarities for collection IDs '.$first->id.' to '.$last->id)
                    ->dispatch();

            $this->info('Starting from ID: '.$first->id.' to ID '.$last->id.' collections (inclusive). Total: '.$collections->count());

            return Command::SUCCESS;
        }

        $queryCallback = fn ($query) => $query->withAcceptableSupply();

        $this->forEachCollection(function ($collection) {
            CalculateTraitRaritiesForCollection::dispatch($collection);
        }, $queryCallback);

        return Command::SUCCESS;
    }
}
