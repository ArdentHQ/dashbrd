<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Data\Web3\CollectionActivity;
use App\Enums\NftTransferType;
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

class FetchBurnActivity implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

    public const LIMIT = 500;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Collection $collection,
        public bool $isFirstRun = true,
    ) {
        $this->onQueue(Queues::SCHEDULED_NFTS);
    }

    /**
     * Execute the job.
     */
    public function handle(MnemonicWeb3DataProvider $provider): void
    {
        if (! config('dashbrd.features.activities') || $this->shouldIgnoreCollection()) {
            return;
        }

        if ($this->collection->isInvalid()) {
            return;
        }

        // This collection never had its activity retrieved, so we don't want to fetch only burn activity...
        if ($this->collection->activity_updated_at === null) {
            return;
        }

        $activities = $provider->getBurnActivity(
            chain: $this->collection->network->chain(),
            contractAddress: $this->collection->address,
            limit: static::LIMIT,
            from: $this->latestActivityTimestamp(),
        );

        if ($activities->isEmpty()) {
            return;
        }

        $formattedActivities = $activities
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
            return;
        }

        DB::transaction(function () use ($formattedActivities, $activities) {
            NftActivity::upsert($formattedActivities, uniqueBy: ['tx_hash', 'log_index', 'collection_id', 'token_number', 'type']);

            // If we get the limit it may be that there are more activities to fetch...
            if (static::LIMIT === count($activities)) {
                self::dispatch($this->collection, isFirstRun: false)->afterCommit();
            }
        }, attempts: 5);
    }

    private function latestActivityTimestamp(): ?Carbon
    {
        if ($this->isFirstRun) {
            return null;
        }

        return $this->collection
                    ->activities()
                    ->where('type', NftTransferType::Burn)
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

    public function retryUntil(): DateTime
    {
        return now()->addHours(2); // This is retry PER JOB (i.e. per request)...
    }
}
