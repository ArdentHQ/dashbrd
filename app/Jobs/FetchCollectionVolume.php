<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Collection;
use App\Models\TradingVolume;
use App\Support\Facades\Mnemonic;
use App\Support\Queues;
use DateTime;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FetchCollectionVolume implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Collection $collection
    ) {
        $this->onQueue(Queues::SCHEDULED_COLLECTIONS);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $volume = Mnemonic::getLatestCollectionVolume(
            chain: $this->collection->network->chain(),
            contractAddress: $this->collection->address
        );

        TradingVolume::upsert([
            'collection_id' => $this->collection->id,
            'volume' => $volume->value,
            'created_at' => $volume->date->toDateString(),
        ], uniqueBy: ['collection_id', 'created_at']);

        $this->collection->update([
            'volume' => $volume->value,
            'volume_1d' => $this->collection->totalVolumeSince(now()->subDays(1)),
            'volume_7d' => $this->collection->totalVolumeSince(now()->subDays(7)),
            'volume_30d' => $this->collection->totalVolumeSince(now()->subDays(30)),
        ]);
    }

    public function uniqueId(): string
    {
        return static::class.':'.$this->collection->id;
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
}
