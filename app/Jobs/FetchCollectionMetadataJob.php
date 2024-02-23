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
                                ->select(['id', 'address', 'extra_attributes'])
                                ->get()
                                ->keyBy(fn ($collection) => Str::lower($collection->address));

        $metadata->each(function (Web3ContractMetadata $data) use ($collections) {
            $collection = $collections->get(Str::lower($data->contractAddress));

            if (! $collection) {
                return;
            }

            if ($data->collectionName) {
                $collection->name = $data->collectionName;
            }

            if ($data->totalSupply !== null) {
                $collection->supply = $data->totalSupply;
            }

            if ($data->mintedBlock) {
                $collection->minted_block = $data->mintedBlock;
            }

            if ($data->description) {
                $collection->description = $data->description;
            }

            if ($data->bannerImageUrl) {
                $collection->extra_attributes->set('banner', $data->bannerImageUrl);
                $collection->extra_attributes->set('banner_updated_at', now());
            }

            if ($data->collectionSlug) {
                $collection->extra_attributes->set('opensea_slug', $data->collectionSlug);
            }

            $collection->save();

            // Sometimes, Alchemy can report supply as `null` even though the collection does have a total supply...
            // In those cases, we want to fallback to OpenSea and use their API to retrieve the supply...
            if ($collection->supply === null && $collection->openSeaSlug() !== null) {
                FetchCollectionSupplyFromOpenSea::dispatch($collection);
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
