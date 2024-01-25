<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\AggregateCollectionWinners;
use App\Models\CollectionWinner;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;

// @codeCoverageIgnore
class AggregateWinners extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:aggregate-winners {--current-month}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Aggregate the "Collection of the Month" winners based on vote count';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $date = $this->option('current-month') ? now() : now()->subMonth();

        $winners = $this->winners();

        if ($winners->isEmpty()) {
            AggregateCollectionWinners::dispatchSync($this->option('current-month'));
        }

        $winners = $this->winners();

        if ($winners->isEmpty()) {
            $this->warn(sprintf('There have been no winners for %s.', $date->format('F Y')));

            return Command::SUCCESS;
        }

        $this->info(sprintf('Done! Here are the winners for %s.', $date->format('F Y')));

        $this->table(['#', 'Collection', 'Votes'], $winners->map(fn ($winner) => [
            $winner->rank,
            $winner->collection->name,
            $winner->votes,
        ]));

        return Command::SUCCESS;
    }

    /**
     * @return Collection<int, CollectionWinner>
     */
    private function winners(): Collection
    {
        $date = $this->option('current-month') ? now() : now()->subMonth();

        return CollectionWinner::query()
                            ->where('month', $date->month)
                            ->where('year', $date->year)
                            ->with('collection')
                            ->orderBy('rank', 'asc')
                            ->get();
    }
}
