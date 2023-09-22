<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Jobs\Traits\WithWeb3DataProvider;
use App\Models\Collection;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DetermineCollectionMintingDate implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels, WithWeb3DataProvider;

    public function __construct(
        public Collection $collection
    ) {
    }

    public function handle(): void
    {
        Log::info('DetermineCollectionMintingDate Job: Processing', [
            'network' => $this->nft->networkId,
            'minted_block' => $this->nft->mintedBlock,
            'token_number' => $this->nft->tokenNumber,
            'token_address' => $this->nft->tokenAddress,
        ]);

        $existing = Collection::query()
                            ->where('network_id', $this->collection->network_id)
                            ->where('minted_block', $this->collection->minted_block)
                            ->whereNotNull('minted_at')
                            ->value('minted_at');

        // Check whether we already have a minted timestamp for the collection with the same minting block...
        if ($existing !== null) {
            $this->collection->update([
                'minted_at' => $existing,
            ]);

            Log::info('DetermineCollectionMintingDate Job: Setting date from existing', [
                'network' => $this->nft->networkId,
                'minted_block' => $this->nft->mintedBlock,
                'token_number' => $this->nft->tokenNumber,
                'token_address' => $this->nft->tokenAddress,
            ]);

            return;
        }

        $timestamp = $this->getWeb3DataProvider()->getBlockTimestamp($this->collection->network, $this->collection->minted_block);

        $this->collection->update([
            'minted_at' => $timestamp,
        ]);

        Log::info('DetermineCollectionMintingDate Job: Setting date from provider', [
            'network' => $this->collection->network->id,
            'minted_block' => $this->collection->minted_block,
            'token_address' => $this->collection->address,
        ]);
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
}
