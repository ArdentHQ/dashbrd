<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Data\Web3\Web3NftData;
use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Jobs\Traits\WithWeb3DataProvider;
use App\Models\Collection;
use App\Models\Network;
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
        public Web3NftData $nft
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
                            ->where('network_id', $this->nft->networkId)
                            ->where('minted_block', $this->nft->mintedBlock)
                            ->whereNotNull('minted_at')
                            ->value('minted_at');

        // Check whether we already have a minted timestamp for the collection with the same minting block...
        if ($existing !== null) {
            $this->touchCollectionDate($existing->toDateTimeString());

            Log::info('DetermineCollectionMintingDate Job: Setting date from existing', [
                'network' => $this->nft->networkId,
                'minted_block' => $this->nft->mintedBlock,
                'token_number' => $this->nft->tokenNumber,
                'token_address' => $this->nft->tokenAddress,
            ]);

            return;
        }

        $network = Network::find($this->nft->networkId);

        $timestamp = $this->getWeb3DataProvider()->getBlockTimestamp($network, $this->nft->mintedBlock);

        $this->touchCollectionDate($timestamp->toDateTimeString());

        Log::info('DetermineCollectionMintingDate Job: Setting date from provider', [
            'network' => $this->nft->networkId,
            'minted_block' => $this->nft->mintedBlock,
            'token_number' => $this->nft->tokenNumber,
            'token_address' => $this->nft->tokenAddress,
        ]);
    }

    private function touchCollectionDate(string $date): void
    {
        Collection::query()
                    ->where('address', $this->nft->tokenAddress)
                    ->where('network_id', $this->nft->networkId)
                    ->update([
                        'minted_at' => $date,
                    ]);
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
}
