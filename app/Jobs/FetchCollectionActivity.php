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
use Illuminate\Support\Str;
use Throwable;

class FetchCollectionActivity implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use RecoversFromProviderErrors;
    use SerializesModels;

    public const LIMIT = 500;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Collection $collection,
        public bool $forced = false,
    ) {
        $this->onQueue(Queues::SCHEDULED_NFTS);
    }

    /**
     * Execute the job.
     */
    public function handle(MnemonicWeb3DataProvider $provider): void
    {
        if (! config('dashbrd.features.activities') || $this->shouldIgnoreCollection()) {
            $this->collection->update([
                'is_fetching_activity' => false,
                'activity_updated_at' => now(),
            ]);

            return;
        }

        if ($this->collection->isInvalid()) {
            $this->collection->update([
                'is_fetching_activity' => false,
                'activity_updated_at' => now(),
            ]);

            return;
        }

        if ($this->collection->is_fetching_activity && ! $this->forced) {
            return;
        }

        $this->collection->update([
            'is_fetching_activity' => true,
        ]);

        $activities = $provider->getCollectionActivity(
            chain: $this->collection->network->chain(),
            contractAddress: $this->collection->address,
            limit: static::LIMIT,
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
            // Sometimes the request is returning transfers that are not labeled as any of the values we expect.
            // There were times when Mnemonic returned `LABEL_BURN` transfers, so we're filtering them here.
            ->reject(fn ($activity) => $activity->type === null)
            ->unique->key()
            ->map(fn (CollectionActivity $activity) => [
                'collection_id' => $this->collection->id,
                'token_number' => $activity->tokenId,
                'type' => $activity->type->value,
                'sender' => $activity->sender,
                'recipient' => $activity->recipient,
                'tx_hash' => $activity->txHash,
                'log_index' => $activity->logIndex,
                'timestamp' => $activity->timestamp,
                'total_native' => $activity->totalNative,
                'total_usd' => $activity->totalUsd,
                'extra_attributes' => json_encode($activity->extraAttributes),
            ])->toArray();

        if (count($formattedActivities) === 0) {
            $this->collection->update([
                'is_fetching_activity' => false,
                'activity_updated_at' => now(),
            ]);

            return;
        }

        DB::transaction(function () use ($formattedActivities, $activities) {
            NftActivity::upsert($formattedActivities, uniqueBy: ['tx_hash', 'log_index', 'collection_id', 'token_number', 'type']);

            // If we get the limit it may be that there are more activities to fetch...
            if (static::LIMIT === count($activities)) {
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

    private function shouldIgnoreCollection(): bool
    {
        /**
         * @var string[]
         */
        $blacklisted = config('dashbrd.activity_blacklist', []);

        return collect($blacklisted)
                        ->map(fn ($collection) => Str::lower($collection))
                        ->contains(Str::lower($this->collection->address));
    }

    public function onFailure(Throwable $exception): void
    {
        $this->collection->update([
            'is_fetching_activity' => false,
            'activity_updated_at' => now(),
        ]);
    }

    public function retryUntil(): DateTime
    {
        return now()->addHours(2); // This is retry PER JOB (i.e. per request)...
    }
}
