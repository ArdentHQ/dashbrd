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

class SyncCollection implements ShouldBeUnique, ShouldQueue
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
        Bus::batch([
            new FetchCollectionTraits($this->collection),
            new FetchCollectionOwners($this->collection),
            new FetchCollectionVolume($this->collection),
            new FetchCollectionBanner($this->collection),
        ])->name('Syncing Collection #'.$this->collection->id)->dispatch();
    }

    public function uniqueId(): string
    {
        return static::class.':'.$this->collection->id;
    }
}
