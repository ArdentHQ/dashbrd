<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Collection;
use App\Support\Facades\Mnemonic;
use App\Support\Queues;
use App\Support\Web3NftCollectionHandler;
use DateTime;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FetchCollectionTraits implements ShouldBeUnique, ShouldQueue
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
        Log::info('FetchCollectionTraits Job: Processing', [
            'collection' => $this->collection->address,
        ]);

        $traits = Mnemonic::getNftCollectionTraits(
            chain: $this->collection->network->chain(),
            contractAddress: $this->collection->address
        );

        (new Web3NftCollectionHandler())->storeTraits($this->collection->id, $traits);

        Log::info('FetchCollectionTraits Job: Handled', [
            'collection' => $this->collection->address,
            'traits_count' => $traits->count(),
        ]);
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }

    public function uniqueId(): string
    {
        return static::class.':'.$this->collection->network->chain_id.'-'.$this->collection->address;
    }
}
