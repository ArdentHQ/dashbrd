<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Data\Web3\Web3NftTransfer;
use App\Enums\Chains;
use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Nft;
use App\Models\NftActivity;
use App\Models\SpamContract;
use App\Support\Facades\Mnemonic;
use App\Support\Queues;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FetchNftActivity implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(private Nft $nft)
    {
        $this->onQueue(Queues::SCHEDULED_NFTS);
    }

    public function uniqueId(): string
    {
        return 'fetch-nft-activty:'.$this->nft->id;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $collection = $this->nft->collection;

        if (SpamContract::isSpam($collection->address, $collection->network)) {
            Log::info('FetchNftActivity Job Ingored for Spam Collection', [
                'address' => $collection->address,
                'network' => $collection->network->id,
            ]);

            return;
        }

        $limit = 500;

        $latestActivityDate = $this->nft->activities()->latest('timestamp')->first()?->timestamp;

        $tokenId = $this->nft->token_number;

        $chainId = $collection->network->chain_id;

        $contractAddress = $collection->address;

        $nftActivity = Mnemonic::getNftActivity(
            chain: Chains::from($chainId),
            contractAddress: $contractAddress,
            tokenId: $tokenId,
            limit: $limit,
            from: $latestActivityDate
        );

        $upserted = NftActivity::upsert(
            $nftActivity->map(function (Web3NftTransfer $activity) {
                return [
                    'nft_id' => $this->nft->id,
                    'type' => $activity->type->value,
                    'sender' => $activity->sender,
                    'recipient' => $activity->recipient,
                    'tx_hash' => $activity->txHash,
                    'timestamp' => $activity->timestamp,
                    'total_native' => $activity->totalNative,
                    'total_usd' => $activity->totalUsd,
                    'extra_attributes' => json_encode($activity->extraAttributes),
                ];
            })->toArray(),
            ['tx_hash', 'nft_id', 'type'],
            ['sender', 'recipient', 'timestamp', 'total_native', 'total_usd', 'extra_attributes']
        );

        // If we get the limit it may be that there are more activities to fetch
        if ($limit === $nftActivity->count()) {
            FetchNftActivity::dispatch($this->nft)->onQueue(Queues::SCHEDULED_WALLET_NFTS);
        }

        Log::info('FetchNftActivity Job Handled', [
            'address' => $collection->address,
            'network' => $collection->network->id,
            'token_number' => $this->nft->token_number,
            'upserted_activities' => $upserted,
            'dispatched_for_more' => $limit === $nftActivity->count(),
        ]);

        $this->nft->touch('last_activity_fetched_at');
    }

    public function retryUntil(): DateTime
    {
        return now()->addHours(2); // This job runs every day so we have some room to allow it to run longer...
    }
}
