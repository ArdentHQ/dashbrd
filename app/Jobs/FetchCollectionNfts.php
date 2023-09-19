<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Jobs\Traits\WithWeb3DataProvider;
use App\Models\Collection;
use App\Support\BlacklistedCollections;
use App\Support\Queues;
use App\Support\Web3NftHandler;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class FetchCollectionNfts implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels, WithWeb3DataProvider;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Collection $collection,
        public ?string $startToken = null
    ) {
        $this->onQueue(Queues::SCHEDULED_NFTS);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('FetchCollectionNfts Job: Processing', [
            'collection' => $this->collection->address,
            'startToken' => $this->startToken,
        ]);

        // Ignore explicitly blacklisted collections
        if (BlacklistedCollections::includes($this->collection->address)) {

            Log::info('FetchCollectionNfts Job: Ignored because blacklisted', [
                'collection' => $this->collection->address,
                'startToken' => $this->startToken,
            ]);

            return;
        }

        // Ignore collections above the supply cap
        if ($this->collection->supply === null || $this->collection->supply > config('dashbrd.collections_max_cap')) {
            Log::info('FetchCollectionNfts Job: Ignored becasue supply is null or > max', [
                'collection' => $this->collection->address,
                'supply' => $this->collection->supply,
                'max' => config('dashbrd.collections_max_cap'),
                'startToken' => $this->startToken,
            ]);

            return;
        }

        $result = $this->getWeb3DataProvider()->getCollectionsNfts($this->collection, $this->startToken);

        (new Web3NftHandler(collection: $this->collection))
                    ->withPersistingLastIndexedTokenNumber()
                    ->store(
                        $result->nfts, dispatchJobs: true
                    );

        if ($result->nextToken !== null) {
            Artisan::call('collections:fetch-nfts', [
                '--collection-id' => $this->collection->id,
                '--start-token' => $result->nextToken,
            ]);
        }

        Log::info('FetchCollectionNfts Job: Handled', [
            'collection' => $this->collection->address,
            'startToken' => $this->startToken,
            'nfts_count' => $result->nfts->count(),
            'nextToken' => $result->nextToken,
        ]);
    }

    public function uniqueId(): string
    {
        return self::class.':'.$this->collection->id.':'.$this->startToken;
    }

    public function retryUntil(): DateTime
    {
        // The job needs to be retried a lot of times because is called
        // multiple times until no more NFTs are found.
        return now()->addHours(3);
    }
}
