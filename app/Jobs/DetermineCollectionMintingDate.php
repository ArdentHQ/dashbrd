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

class DetermineCollectionMintingDate implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels, WithWeb3DataProvider;

    public function __construct(
        public Collection $collection
    ) {
    }

    public function handle(): void
    {
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

            return;
        }

        $timestamp = $this->getWeb3DataProvider()->getBlockTimestamp($this->collection->network, $this->collection->minted_block);

        $this->collection->update([
            'minted_at' => $timestamp,
        ]);
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
}
