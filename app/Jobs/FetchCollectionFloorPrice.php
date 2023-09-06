<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\Chains;
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
use Illuminate\Support\Str;

class FetchCollectionFloorPrice implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, WithWeb3DataProvider, RecoversFromProviderErrors;

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
        $web3DataProvider = $this->getWeb3DataProvider();
        $floorPrice = $web3DataProvider->getNftCollectionFloorPrice(
            Chains::from($this->chainId), $this->address
        );

        $collection = Collection::where('address', $this->address)
            ->whereHas('network', fn ($query) => $query->where('chain_id', $this->chainId))
            ->first();

        if ($floorPrice == null) {
            $collection->update([
                'floor_price' => null,
                'floor_price_token_id' => null,
                'floor_price_retrieved_at' => Carbon::now(),
            ]);
        } else {
            $token = Token::bySymbol(Str::upper($floorPrice->currency))
                ->orderBy('id')
                ->first();

            $collection->update([
                'floor_price' => $token ? $floorPrice->price : null,
                'floor_price_token_id' => $token?->id,
                'floor_price_retrieved_at' => $token ? $floorPrice->retrievedAt : null,
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
}
