<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Collection;
use App\Support\Facades\Opensea;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FetchCollectionSupplyFromOpenSea implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

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
        $slug = $this->collection->openSeaSlug();

        if ($slug === null) {
            return;
        }

        $this->collection->update([
            'supply' => Opensea::getCollectionSupply($slug),
        ]);
    }

    public function uniqueId(): string
    {
        return static::class.':'.$this->collection->id;
    }

    public function retryUntil(): DateTime
    {
        return now()->addHours(2);
    }
}
