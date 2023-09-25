<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Middleware\RecoverProviderErrors;
use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Collection;
use App\Models\Nft;
use App\Models\SpamContract;
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
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use RecoversFromProviderErrors;
    use SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Collection $collection,
        public Nft $nft,
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(AlchemyWeb3DataProvider $provider): void
    {
        if (SpamContract::isSpam($this->collection->address, $this->collection->network)) {
            return;
        }

        $nfts = Nft::whereNotNull('metadata_requested_at')
            ->where(function ($query) {
                $query->whereRaw('metadata_fetched_at < metadata_requested_at');
            })->get();

        Log::info('RefreshNftMetadata Job: Processing', [
            'address' => $this->collection->address,
            'network' => $this->collection->network->id,
            'token_numbers' => $this->nft->token_number,
        ]);

        // TODO: chunks of 100 (Alchemy limit).
        $result = $provider->getNftMetadata($nfts);

        (new Web3NftHandler(collection: $this->collection))->store(
            $result->nfts,
            dispatchJobs: true
        );

        Nft::whereIn('id', $result->nfts->map(fn ($nft) => $nft->id))->update(['metadata_fetched_at' => now()]);

        Log::info('RefreshNftMetadata Job: Handled with Web3NftHandler', [
            'nfts_count' => $result->nfts->count(),
            'address' => $this->collection->address,
            'network' => $this->collection->network->id,
        ]);
    }

    public function uniqueId(): string
    {
        return self::class.':'.$this->nft->id;
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
