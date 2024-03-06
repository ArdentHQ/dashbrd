<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Jobs\Traits\WithWeb3DataProvider;
use App\Models\Collection;
use App\Support\Facades\Opensea;
use App\Support\Queues;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FetchCollectionOpenseaSlug implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels, WithWeb3DataProvider;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Collection $collection
    ) {
        $this->onQueue(Queues::SCHEDULED_NFTS);
    }

    /**
     * Execute the job.
     * Attention! This job assumes that you already filtered invalid collections.
     */
    public function handle(): void
    {
        $this->collection->extra_attributes->set('opensea_slug_last_fetched_at', Carbon::now());
        $this->collection->save();

        $nft = $this->collection->nfts()->first();

        $result = Opensea::nft(
            chain: $this->collection->network->chain(),
            address: $this->collection->address,
            identifier: $nft->token_number,
        );

        if ($result !== null) {
            $this->collection->extra_attributes->set('opensea_slug', $result->collectionSlug());
            $this->collection->save();
        } else {
            Log::info('FetchCollectionOpenseaSlug Job: No slug found', [
                'collection' => $this->collection->address,
            ]);
        }
    }

    public function uniqueId(): string
    {
        return self::class.':'.$this->collection->id;
    }
}
