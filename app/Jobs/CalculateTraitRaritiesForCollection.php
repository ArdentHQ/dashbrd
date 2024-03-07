<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Collection;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Bus;

class CalculateTraitRaritiesForCollection implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Collection $collection
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if ($this->collection->isInvalid()) {
            return;
        }

        Bus::batch($this->collection->traits->chunk(500)->map(
            fn ($chunk) => new CalculateTraitRarities($this->collection, $chunk)
        ))->name('Calculating rarities for collection #'.$this->collection->id)->dispatch();
    }

    public function uniqueId(): string
    {
        return static::class.':'.$this->collection->id;
    }
}
