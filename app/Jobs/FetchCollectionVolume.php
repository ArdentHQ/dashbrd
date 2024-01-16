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

        $volumes = Mnemonic::getNftCollectionVolume(
            chain: $this->collection->network->chain(),
            contractAddress: $this->collection->address
        );

        $data = array_filter([
            'volume' => $volumes['1d'],
            'volume_7d' => $volumes['7d'],
            'volume_1m' => $volumes['1m'],
        ], fn ($value) => $value !== null);

        $this->collection->update($data);

        Collection::updateMonthlyRankAndVotes();

        Log::info('FetchCollectionVolume Job: Handled', [
            'collection' => $this->collection->address,
            'volume_1d' => $volumes['1d'],
            'volume_7d' => $volumes['7d'],
            'volume_1m' => $volumes['1m'],
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
