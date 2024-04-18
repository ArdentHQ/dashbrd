<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Data\Web3\Web3Volume;
use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Collection;
use App\Models\TradingVolume;
use App\Support\Facades\Mnemonic;
use App\Support\Queues;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FetchCollectionVolumeHistory implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

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
        if ($this->collection->network->chain()->isPolygon()) {
            return;
        }

        $volumes = Mnemonic::getCollectionVolumeHistory(
            chain: $this->collection->network->chain(),
            address: $this->collection->address,
        );

        TradingVolume::upsert($volumes->map(fn (Web3Volume $volume) => [
            'collection_id' => $this->collection->id,
            'volume' => $volume->value,
            'created_at' => $volume->date->toDateString(),
        ])->toArray(), uniqueBy: ['collection_id', 'created_at']);

        $this->collection->update([
            'volume_1d' => $volumes->sortByDesc(fn ($volume) => $volume->date->timestamp)->first()->value,
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
