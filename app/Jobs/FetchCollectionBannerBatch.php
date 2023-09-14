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
use Illuminate\Support\Str;

class FetchCollectionBannerBatch implements ShouldBeUnique, ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @param  array<string>  $collectionAddresses
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

        $collections = Collection::query()
            ->whereIn('address', $metadata->pluck('contractAddress'))
            ->select(['id', 'address'])
            ->get();

        $metadata
            ->filter(fn ($data) => $data->bannerImageUrl !== null)
            ->each(function (Web3ContractMetadata $data) use ($collections) {
                $address = Str::lower($data->contractAddress);

                $collection = $collections->first(fn ($collection) => Str::lower($collection->address) === $address);

                if ($collection) {
                    Log::info('Updating collection banner', [
                        'collection_address' => $address,
                        'banner' => $data->bannerImageUrl,
                    ]);

                    $collection->extra_attributes->set('banner', $data->bannerImageUrl);
                    $collection->extra_attributes->set('banner_updated_at', now());

                    $collection->save();
                }
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
