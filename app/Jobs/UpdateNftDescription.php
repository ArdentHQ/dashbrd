<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Network;
use App\Models\Nft;
use App\Services\Web3\Alchemy\AlchemyWeb3DataProvider;
use App\Support\Web3NftHandler;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateNftDescription implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $startId,
        public Network $network,
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(AlchemyWeb3DataProvider $provider): void
    {
        $nfts = Nft::query()
                    ->whereHas('collection', fn ($query) => $query->where('network_id', $this->network->id))
                    ->where('id', '>=', $this->startId)
                    ->limit(100)
                    ->oldest('id')
                    ->get();

        if ($nfts->isEmpty()) {
            $nextNetwork = Network::query()
                                ->onlyMainnet()
                                ->where('id', '>', $this->network->id)
                                ->oldest('id')
                                ->first();

            if (! $nextNetwork) {
                info('Done indexing descriptions!');

                return;
            }

            // Start from first NFT...
            self::dispatch(1, $nextNetwork);

            return;
        }

        $result = $provider->getNftMetadata($nfts, $this->network);

        (new Web3NftHandler(network: $this->network))->store($result->nfts, dispatchJobs: false);

        $lastId = $nfts->sortByDesc('id')->first()->id;

        self::dispatch($lastId + 1, $this->network);
    }

    public function uniqueId(): string
    {
        return static::class.':'.$this->startId.':'.$this->network->id;
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(20);
    }
}
