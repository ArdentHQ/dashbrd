<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Collection;
use App\Support\Facades\Mnemonic;
use App\Support\Queues;
use DateTime;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

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
        $volume = Mnemonic::getCollectionVolume(
            chain: $this->collection->network->chain(),
            contractAddress: $this->collection->address
        );

        DB::transaction(function () use ($volume) {
            $this->collection->volumes()->create([
                'volume' => $volume ?? '0',
            ]);

            $this->collection->volume = $volume;

            // We only want to update total volumes in the given period if we have enough data for that period...

            if ($this->collection->volumes()->where('created_at', '<', now()->subDays(1))->exists()) {
                $this->collection->volume_1d = $this->collection->totalVolumeSince(now()->subDays(1));
            }

            if ($this->collection->volumes()->where('created_at', '<', now()->subDays(7))->exists()) {
                $this->collection->volume_7d = $this->collection->totalVolumeSince(now()->subDays(7));
            }

            if ($this->collection->volumes()->where('created_at', '<', now()->subDays(30))->exists()) {
                $this->collection->volume_30d = $this->collection->totalVolumeSince(now()->subDays(30));
            }

            $this->collection->save();
        });

        ResetCollectionRanking::dispatch();
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
