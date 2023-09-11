<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Data\Web3\CollectionActivity;
use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Collection;
use App\Models\NftActivity;
use App\Services\Web3\Mnemonic\MnemonicWeb3DataProvider;
use App\Support\Queues;
use Carbon\Carbon;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class FetchCollectionActivity implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private Collection $collection,
        public bool $forced = false,
    ) {
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

        if ($this->collection->is_fetching_activity && ! $this->forced) {
            return;
        }

        $this->collection->update([
            'is_fetching_activity' => true,
        ]);

        $limit = 500;

        $activities = $provider->getCollectionActivity(
            chain: $this->collection->network->chain(),
            contractAddress: $this->collection->address,
            limit: $limit,
            from: $this->latestActivityTimestamp(),
        );

        if ($activities->isEmpty()) {
            $this->collection->update([
                'is_fetching_activity' => false,
                'activity_updated_at' => now(),
            ]);

            return;
        }

        $formattedActivities = $activities
            // Sometimes the request is returning transfers that are not labeled
            // as any of the values we expect, I was, for example getting
            // `LABEL_BURN` transfers, so I am filtering them out here.
            // In the future we may want to add support for them.
            ->reject(fn ($activity) => $activity->type === null)
            ->unique->key()
            ->map(fn (CollectionActivity $activity) => [
                'collection_id' => $this->collection->id,
                'token_number' => $activity->tokenId,
                'type' => $activity->type->value,
                'sender' => $activity->sender,
                'recipient' => $activity->recipient,
                'tx_hash' => $activity->txHash,
                'timestamp' => $activity->timestamp,
                'total_native' => $activity->totalNative,
                'total_usd' => $activity->totalUsd,
                'extra_attributes' => json_encode($activity->extraAttributes),
            ])->toArray();

        DB::transaction(function () use ($formattedActivities, $activities, $limit) {
            NftActivity::upsert($formattedActivities, ['tx_hash', 'collection_id', 'token_number', 'type']);

            // If we get the limit it may be that there are more activities to fetch...
            if (count($activities) === $limit) {
                self::dispatch($this->collection, forced: true)->afterCommit();
            } else {
                $this->collection->update([
                    'is_fetching_activity' => false,
                    'activity_updated_at' => now(),
                ]);
            }
        }, attempts: 5);
    }

    private function latestActivityTimestamp(): ?Carbon
    {
        return $this->collection
                    ->activities()
                    ->latest('timestamp')
                    ->value('timestamp');
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10); // This is retry PER JOB (i.e. per request)...
    }
}
