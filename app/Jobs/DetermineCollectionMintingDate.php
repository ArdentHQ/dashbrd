<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Jobs\Traits\WithWeb3DataProvider;
use App\Models\Collection;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DetermineCollectionMintingDate implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels, WithWeb3DataProvider;

    public function __construct(
        public Collection $collection
    ) {
    }

    public function handle(): void
    {
        $timestamp = Collection::query()
                            ->where('network_id', $this->collection->network_id)
                            ->where('minted_block', $this->collection->minted_block)
                            ->whereNotNull('minted_at')
                            ->value('minted_at');

        // If there is no collection with the same minting block that has a minted date, retrieve the date from Alchemy...
        if ($timestamp === null) {
            $timestamp = $this->getWeb3DataProvider()->getBlockTimestamp($this->collection->network, $this->collection->minted_block);
        }

        $this->collection->update([
            'minted_at' => $timestamp,
        ]);
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }

    public function uniqueId(): string
    {
        return static::class.':'.$this->collection->id;
    }
}
