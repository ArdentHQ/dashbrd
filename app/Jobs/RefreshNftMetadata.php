<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Middleware\RecoverProviderErrors;
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
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RefreshNftMetadata implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(AlchemyWeb3DataProvider $provider): void
    {
        Network::onlyMainnet()->get()->each(function ($network) use ($provider) {
            $this->refreshForNetwork($network, $provider);
        });
    }

    private function refreshForNetwork(Network $network, AlchemyWeb3DataProvider $provider): void
    {
        $nfts = Nft::query()
                    ->whereNull('burned_at')
                    ->whereNotNull('metadata_requested_at')
                    ->whereHas('collection', fn ($q) => $q->where('network_id', $network->id))
                    ->where(function ($query) {
                        return $query->whereNull('metadata_fetched_at')
                                        ->orWhereRaw('metadata_fetched_at < metadata_requested_at');
                    })
                    ->get();

        if (count($nfts) === 0) {
            Log::info('RefreshNftMetadata Job: No nfts found for metadata update. Aborting.');

            return;
        }

        // Chunk by 100 to comply with Alchemy's batch limit...
        $nfts->chunk(100)->map(function ($nftsChunk) use ($provider, $network) {
            $result = $provider->getNftMetadata($nftsChunk, $network);

            (new Web3NftHandler(network: $network))->store($result->nfts);
        });

        Log::info('RefreshNftMetadata Job: Handled with Web3NftHandler', [
            'nfts_count' => $nfts->count(),
            'network' => $network->id,
        ]);
    }

    public function uniqueId(): string
    {
        return self::class;
    }

    /**
     * @return object[]
     */
    public function middleware(): array
    {
        return [
            new RateLimited('nft-refresh'),
            new RecoverProviderErrors(),
        ];
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
}
