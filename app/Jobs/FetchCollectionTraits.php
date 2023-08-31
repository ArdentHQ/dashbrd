<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Collection;
use App\Support\Facades\Mnemonic;
use App\Support\Queues;
use App\Support\Web3NftCollectionHandler;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FetchCollectionTraits implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, RecoversFromProviderErrors;

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
        $traits = Mnemonic::getNftCollectionTraits(
            chain: $this->collection->network->chain(),
            contractAddress: $this->collection->address
        );

        (new Web3NftCollectionHandler())->storeTraits($this->collection->id, $traits);
    }

    public function uniqueId(): string
    {
        return 'fetch-nft-collection-traits:'.$this->collection->network->chain_id.'-'.$this->collection->address;
    }
}
