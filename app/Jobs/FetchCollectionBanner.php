<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Data\Web3\Web3ContractMetadata;
use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Alchemy;
use App\Support\Queues;
use DateTime;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FetchCollectionBanner implements ShouldBeUnique, ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public array $collectionAddresses,
        public Network $network,
    ) {
        $this->onQueue(Queues::SCHEDULED_COLLECTIONS);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $metadata = Alchemy::getContractMetadataBatch($this->collectionAddresses, $this->network);

        $metadata->each(function (Web3ContractMetadata $data) {
            Log::info("Updating collection banner", [
                'address' => $data->contractAddress,
                'bannerImageUrl' => $data->bannerImageUrl
            ]);

            Collection::query()->where('id', $data->contractAddress)
                ->update(['extra_attributes->banner' => $data->bannerImageUrl]);
        });
    }

    public function uniqueId(): string
    {
        $sortedAddresses = [...$this->collectionAddresses];
        sort($sortedAddresses);

        return static::class.':'.$this->network->chain_id.'-'.implode('-', $sortedAddresses);
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
}
