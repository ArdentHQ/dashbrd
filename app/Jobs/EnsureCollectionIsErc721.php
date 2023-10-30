<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Collection;
use App\Services\Web3\Mnemonic\MnemonicWeb3DataProvider;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class EnsureCollectionIsErc721 implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Collection $collection
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(MnemonicWeb3DataProvider $provider): void
    {
        if ($this->collection->had_erc721_check) {
            return;
        }

        if ($provider->isErc721($this->collection->network->chain(), $this->collection->address)) {
            Log::warning('Collection is not ERC721', [
                'chain_id' => $this->collection->network->chain_id,
                'address' => $this->collection->address,
            ]);

            $this->collection->delete();

            return;
        }

        $this->collection->update([
            'had_erc721_check' => true,
        ]);
    }

    public function uniqueId(): string
    {
        return static::class.':'.$this->collection->id;
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(30);
    }
}
