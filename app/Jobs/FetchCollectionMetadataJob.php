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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FetchCollectionMetadataJob implements ShouldBeUnique, ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors;

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
            ->each(function (Web3ContractMetadata $data) use ($collections) {
                $address = Str::lower($data->contractAddress);

                $collection = $collections->first(fn ($collection) => $address === Str::lower($collection->address));

                if ($collection) {
                    Log::info('Updating collection metadata', [
                        'collection_address' => $address,
                        'name' => $data->collectionName,
                        'total_supply' => $data->totalSupply,
                        'floor_price' => $data->floorPrice,
                        'description' => $data->description,
                        'banner' => $data->bannerImageUrl,
                    ]);

                    $collection->name = $data->collectionName;
                    $collection->supply = $data->totalSupply;
                    $collection->minted_block = $data->mintedBlock;

                    if ($data->description) {
                        $collection->description = $data->description;
                    }

                    if ($data->floorPrice) {
                        $collection->floor_price = (string) ($data->floorPrice * 1e18);
                    }

                    if ($data->bannerImageUrl) {
                        $collection->extra_attributes->set('banner', $data->bannerImageUrl);
                        $collection->extra_attributes->set('banner_updated_at', now());
                    }

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
