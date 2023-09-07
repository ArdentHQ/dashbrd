<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Data\Web3\CollectionActivity;
use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Collection;
use App\Models\NftActivity;
use App\Services\Web3\Mnemonic\MnemonicWeb3DataProvider;
use App\Support\Queues;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class FetchCollectionActivity implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private Collection $collection
    )
    {
        $this->onQueue(Queues::SCHEDULED_NFTS);
    }

    /**
     * Execute the job.
     */
    public function handle(MnemonicWeb3DataProvider $provider): void
    {
        if ($this->collection->isSpam()) {
            return;
        }

        // We add one more in the provider, to check if there are more records...
        $limit = 499;

        $activities = $provider->getCollectionActivity(
            chain: $this->collection->network->chain(),
            contractAddress: $this->collection->address,
            limit: $limit,
            from: $this->collection->activities()->latest('timestamp')->value('timestamp')
        )->map(fn (CollectionActivity $activity) => [
            'nft_id' => $activity->tokenId,
            'type' => $activity->type->value,
            'sender' => $activity->sender,
            'recipient' => $activity->recipient,
            'tx_hash' => $activity->txHash,
            'timestamp' => $activity->timestamp,
            'total_native' => $activity->totalNative,
            'total_usd' => $activity->totalUsd,
            'extra_attributes' => json_encode($activity->extraAttributes),
        ])->toArray();

        DB::transaction(function () use ($activities, $limit) {
            NftActivity::upsert($activities, ['tx_hash', 'nft_id', 'type']);

            $this->collection->touch('last_activity_fetched_at');

            // If we get the limit+1 it may be that there are more activities to fetch...
            if (count($activities) > $limit) {
                self::dispatch($this->collection)->afterCommit();
            }
        });
    }

    public function retryUntil(): DateTime
    {
        return now()->addHours(1);
    }

    public function uniqueId(): string
    {
        return static::class.':'.$this->collection->id;
    }
}
