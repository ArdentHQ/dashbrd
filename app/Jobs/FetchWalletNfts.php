<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Jobs\Traits\WithWeb3DataProvider;
use App\Models\Network;
use App\Models\Wallet;
use App\Support\Cache\GalleryCache;
use App\Support\Cache\UserCache;
use App\Support\Queues;
use App\Support\Web3NftHandler;
use Carbon\Carbon;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FetchWalletNfts implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels, WithWeb3DataProvider;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Wallet $wallet,
        public Network $network,
        public ?string $cursor = null,
        public ?Carbon $startTimestamp = null,
    ) {
        $this->onQueue(Queues::SCHEDULED_WALLET_NFTS);
        $this->startTimestamp = $this->startTimestamp ?? Carbon::now();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $result = $this->getWeb3DataProvider()->getWalletNfts($this->wallet, $this->network, $this->cursor);

        $nftHandler = new Web3NftHandler(wallet: $this->wallet, network: $this->network);

        $nftHandler->store($result->nfts, true);

        self::dispatchIf(
            $result->nextToken !== null,
            $this->wallet,
            $this->network,
            $result->nextToken,
            $this->startTimestamp
        );

        if ($result->nextToken === null) {
            $nftHandler->cleanupNftsAndGalleries($this->startTimestamp);
        }

        // clear individual dirty gallery caches so they update ASAP
        GalleryCache::clearAllDirty();

        UserCache::clearAll($this->wallet->user);
    }

    public function uniqueId(): string
    {
        return self::class.':'.$this->wallet->id.':'.$this->network->chain_id.':'.$this->cursor;
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(20);
    }
}
