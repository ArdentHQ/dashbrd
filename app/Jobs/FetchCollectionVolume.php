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
use Illuminate\Support\Facades\Log;

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
        Log::info('FetchCollectionVolume Job: Processing', [
            'collection' => $this->collection->address,
        ]);

        $volume = Mnemonic::getNftCollectionVolume(
            chain: $this->collection->network->chain(),
            contractAddress: $this->collection->address
        );

        DB::transaction(function () use ($volume) {
            if ($volume !== null) {
                $this->collection->volumeChanges()->create([
                    'volume' => $volume,
                ]);

                $this->collection->volume = $volume;

                if ($this->collection->volumeChanges()->where('created_at', '<', now()->subDays(1))->exists()) {
                    $this->collection->avg_volume_24h = $this->collection->volumeChanges()->where('created_at', '>', now()->subDays(1))->avg('volume');
                }

                if ($this->collection->volumeChanges()->where('created_at', '<', now()->subDays(7))->exists()) {
                    $this->collection->avg_volume_7d = $this->collection->volumeChanges()->where('created_at', '>', now()->subDays(7))->avg('volume');
                }

                if ($this->collection->volumeChanges()->where('created_at', '<', now()->subMonths(1))->exists()) {
                    $this->collection->avg_volume_1m = $this->collection->volumeChanges()->where('created_at', '>', now()->subMonths(1))->avg('volume');
                }

                $this->collection->save();
            } else {
                $this->collection->update([
                    'volume' => $volume,
                ]);
            }
        });

        Log::info('FetchCollectionVolume Job: Handled', [
            'collection' => $this->collection->address,
            'volume' => $volume,
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
