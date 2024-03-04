<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\NftTransferType;
use App\Models\Collection as ModelsCollection;
use App\Models\NftActivity;
use App\Support\CryptoUtils;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ProcessAlchemyWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @param  Collection<string, mixed>  $activity
     */
    public function __construct(
        public Collection $activity
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $collections = $this->collections();

        $activity = $this->activity->map(fn ($activity) => [
            'type' => $this->determineType($activity),
            'sender' => $activity['fromAddress'],
            'recipient' => $activity['toAddress'],
            'collection_id' => $collections[Str::lower($activity['contractAddress'])]?->id,
            'timestamp' => now(),
            'total_native' => 0,
            'total_usd' => 0,
            'token_id' => CryptoUtils::hexToBigIntStr($activity['erc721TokenId']),
            'extra_attributes' => [],
            'tx_hash' => $activity['log']['transactionHash'],
            'log_index' => $activity['log']['logIndex'],
        ])->reject(fn ($activity) => $activity['collection_id'] === null);

        NftActivity::upsert($activity->toArray(), uniqueBy: ['tx_hash', 'log_index', 'collection_id', 'token_number', 'type']);

        $burnActivities = $activity->filter(
            fn ($activity) => $activity->type === NftTransferType::Burn
        )->groupBy('collection_id');

        if ($burnActivities->isNotEmpty()) {
            $burnActivities->each(function ($activity, $collectionId) use ($collections) {
                SyncBurnedNfts::dispatch($collections->first(fn ($collection) => $collection->id === $collectionId), $activity);
            });
        }
    }

    private function determineType(array $activity): NftTransferType
    {
        if ($activity['fromAddress'] === '0x0000000000000000000000000000000000000000') {
            return NftTransferType::Mint;
        }

        if ($activity['toAddress'] === '0x0000000000000000000000000000000000000000') {
            return NftTransferType::Burn;
        }

        return NftTransferType::Transfer;
    }

    /**
     * @return Collection<string, ModelsCollection>
     */
    private function collections(): Collection
    {
        return ModelsCollection::query()
                    ->whereIn('address', $this->activity->pluck('contractAddress'))
                    ->get()
                    ->keyBy(fn ($collection) => Str::lower($collection->address));
    }
}
