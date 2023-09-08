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

class FetchCollectionOwners implements ShouldQueue
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
        $owners = Mnemonic::getNftCollectionOwners(
            chain: $this->collection->network->chain(),
            contractAddress: $this->collection->address
        );

        $this->collection->update([
            'owners' => $owners,
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
