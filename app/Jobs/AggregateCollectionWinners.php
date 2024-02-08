<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Models\Collection;
use App\Models\CollectionWinner;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection as LaravelCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AggregateCollectionWinners implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public bool $currentMonth = false
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $previousMonth = $this->currentMonth
                        ? now()
                        : now()->subMonth();

        $winners = $this->winners();

        $collections = $winners->map(fn ($collection, $index) => [
            'collection_id' => $collection->id,
            'votes' => $collection->votes_count,
            'month' => $previousMonth->month,
            'year' => $previousMonth->year,
            'rank' => $index + 1,
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();

        DB::transaction(function () use ($collections, $previousMonth) {
            // We created the 3 winners, so remove all others for the month and year...
            // This is to prevent accidental bugs if this job runs multiple times in a month...
            CollectionWinner::query()
                        ->where('month', $previousMonth->month)
                        ->where('year', $previousMonth->year)
                        ->delete();

            CollectionWinner::upsert($collections, uniqueBy: ['collection_id', 'month', 'year']);
        });

        Cache::forget('collection-winners:current');
    }

    /**
     * @return LaravelCollection<int, Collection>
     */
    private function winners(): LaravelCollection
    {
        return Collection::query()
                        ->eligibleToWin()
                        ->whereHas('votes', fn ($q) => $this->currentMonth ? $q->inCurrentMonth() : $q->inPreviousMonth())
                        ->withCount([
                            'votes' => fn ($q) => $this->currentMonth ? $q->inCurrentMonth() : $q->inPreviousMonth(),
                        ])
                        ->limit(3)
                        ->orderBy('votes_count', 'desc')
                        ->orderByVolume(Period::MONTH, currency: CurrencyCode::USD)
                        ->get();
    }

    public function uniqueId(): string
    {
        return static::class;
    }
}
