<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Collection as CollectionModel;
use App\Models\Wallet;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Bus;

class RefreshWalletCollections implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Wallet $wallet
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $wallet = $this->wallet;

        $wallet->update([
            'is_refreshing_collections' => true,
        ]);

        Bus::batch($this->collections()->flatMap(fn ($collection) => [
            new FetchCollectionFloorPrice($collection->network->chain_id, $collection->address),
            new FetchCollectionTraits($collection),
            new FetchCollectionOwners($collection),
            new FetchCollectionVolume($collection),
        ]))->finally(function () use ($wallet) {
            $wallet->update([
                'is_refreshing_collections' => false,
                'refreshed_collections_at' => now(),
            ]);
        })->name('Refreshing collections for wallet #'.$wallet->id)->dispatch();
    }

    /**
     * @return Collection<int, CollectionModel>
     */
    private function collections(): Collection
    {
        /** @var Collection<int, CollectionModel> */
        $collections = $this->wallet
                            ->nfts
                            ->load('collection.network')
                            ->map(fn ($nft) => $nft->collection);

        return $collections->flatten()->unique();
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
            new RateLimited('collections-refresh'),
        ];
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
}
