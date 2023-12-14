<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Collection;
use App\Models\CollectionWinner;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection as LaravelCollection;

class AggregateCollectionWinners implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $previousMonth = now()->subMonth();

        $winners = $this->winners();

        CollectionWinner::insert($winners->map(fn ($collection) => [
            'collection_id' => $collection->id,
            'votes' => $collection->votes_count,
            'month' => $previousMonth->month,
            'year' => $previousMonth->year,
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray());
    }

    /**
     * @return LaravelCollection<int, Collection>
     */
    private function winners(): LaravelCollection
    {
        return Collection::query()
                        ->withTrashed()
                        ->eligibleToWin()
                        ->whereHas('votes', fn ($q) => $q->inPreviousMonth())
                        ->withCount([
                            'votes' => fn ($q) => $q->inPreviousMonth(),
                        ])
                        ->limit(3)
                        ->get();
    }

    public function uniqueId(): string
    {
        return static::class;
    }
}
