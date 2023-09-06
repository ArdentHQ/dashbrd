<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Collection;
use App\Support\Facades\Mnemonic;
use App\Support\Queues;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FetchCollectionBanner implements ShouldQueue, ShouldBeUnique
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
        $banner = Mnemonic::getNftCollectionBanner(
            chain: $this->collection->network->chain(),
            contractAddress: $this->collection->address
        );

        $this->collection->extra_attributes->set('banner', $banner);

        $this->collection->save();
    }

    public function uniqueId(): string
    {
        return 'fetch-nft-collection-banner:'.$this->collection->network->chain_id.'-'.$this->collection->address;
    }

    public function retryUntil(): DateTime
    {
        return now()->addHours(2); // This job runs every day so we have some room to allow it to run longer...
    }
}
