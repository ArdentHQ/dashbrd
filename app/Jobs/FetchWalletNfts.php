<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\TokenType;
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
use Illuminate\Support\Facades\Log;

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
        public ?bool $ownsErc1155Nfts = null,
    ) {
        $this->onQueue(Queues::SCHEDULED_WALLET_NFTS);
        $this->startTimestamp = $this->startTimestamp ?? Carbon::now();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('FetchWalletNfts Job: Processing', [
            'wallet' => $this->wallet->address,
            'network' => $this->network->id,
            'cursor' => $this->cursor,
            'start_timestamp' => $this->startTimestamp?->toDateTimeString(),
        ]);

        $result = $this->getWeb3DataProvider()->getWalletNfts($this->wallet, $this->network, $this->cursor);

        $containsErc1155 = $result->nfts->contains(fn ($nft) => $nft->type === TokenType::Erc1155);

        $nftHandler = new Web3NftHandler(wallet: $this->wallet, network: $this->network);

        $nftHandler->store($result->nfts, true);

        self::dispatchIf(
            $result->nextToken !== null,
            $this->wallet,
            $this->network,
            $result->nextToken,
            $this->startTimestamp,
            $containsErc1155 === true ? true : $this->ownsErc1155Nfts, // If the current set of NFTs contains ERC1155, set to `true`, otherwise proxy through...
        );

        if ($result->nextToken === null) {
            Log::info('FetchWalletNfts Job: run cleanupNftsAndGalleries', [
                'wallet' => $this->wallet->address,
                'network' => $this->network->id,
                'cursor' => $this->cursor,
                'start_timestamp' => $this->startTimestamp?->toDateTimeString(),
            ]);

            $nftHandler->cleanupNftsAndGalleries($this->startTimestamp);

            $this->wallet->update([
                'owns_erc1155_tokens' => $this->ownsErc1155Nfts || $containsErc1155,
            ]);
        }

        // clear individual dirty gallery caches so they update ASAP
        GalleryCache::clearAllDirty();

        UserCache::clearAll($this->wallet->user);

        Log::info('FetchWalletNfts Job: handled with Web3NftHandler', [
            'nfts_count' => $result->nfts->count(),
            'wallet' => $this->wallet->address,
            'network' => $this->network->id,
            'next_token' => $result->nextToken,
            'cursor' => $this->cursor,
            'start_timestamp' => $this->startTimestamp?->toDateTimeString(),
        ]);
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
