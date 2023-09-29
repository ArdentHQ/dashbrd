<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\Chains;
use App\Enums\Service;
use App\Jobs\Middleware\RateLimited;
use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Jobs\Traits\WithWeb3DataProvider;
use App\Models\Collection;
use App\Models\Token;
use App\Support\Queues;
use Carbon\Carbon;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FetchCollectionFloorPrice implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels, WithWeb3DataProvider;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $chainId,
        public string $address,
    ) {
        $this->onQueue(Queues::SCHEDULED_NFTS);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('FetchCollectionFloorPrice Job: Processing', [
            'chainId' => $this->chainId,
            'address' => $this->address,
        ]);

        $web3DataProvider = $this->getWeb3DataProvider();
        $floorPrice = $web3DataProvider->getNftCollectionFloorPrice(
            Chains::from($this->chainId), $this->address
        );

        $collection = Collection::where('address', $this->address)
            ->whereHas('network', fn ($query) => $query->where('chain_id', $this->chainId))
            ->first();

        if ($floorPrice === null) {
            $collection->update([
                'floor_price' => null,
                'floor_price_token_id' => null,
                'floor_price_retrieved_at' => Carbon::now(),
            ]);

            Log::info('FetchCollectionFloorPrice Job: Cleared floor price', [
                'chainId' => $this->chainId,
                'address' => $this->address,
                'collection' => $collection->address,
            ]);
        } else {
            $token = Token::bySymbol(Str::upper($floorPrice->currency))
                ->orderBy('id')
                ->first();

            $price = $token ? $floorPrice->price : null;

            $collection->update([
                'floor_price' => $price,
                'floor_price_token_id' => $token?->id,
                'floor_price_retrieved_at' => $token ? $floorPrice->retrievedAt : null,
            ]);

            Log::info('FetchCollectionFloorPrice Job: Set floor price', [
                'chainId' => $this->chainId,
                'address' => $this->address,
                'collection' => $collection->address,
                'floor_price' => $price,
                'floor_price_token_id' => $token?->id,
            ]);
        }

        Collection::updateFiatValue([$collection->id]);
    }

    public function uniqueId(): string
    {
        return 'fetch-nft-collection-floor-price:'.$this->chainId.'-'.$this->address;
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(30);
    }

    /**
     * Get the middleware the job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new RateLimited(Service::Opensea)];
    }
}
