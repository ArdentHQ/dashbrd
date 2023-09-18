<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Jobs\Traits\WithWeb3DataProvider;
use App\Models\Collection;
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
        if (Collection::isInvalid($this->collection, false)) {
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
