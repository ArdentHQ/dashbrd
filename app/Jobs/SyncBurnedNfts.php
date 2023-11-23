<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Collection;
use App\Support\Queues;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection as LaravelCollection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SyncBurnedNfts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Collection $collection,
        public LaravelCollection $activity,
    ) {
        $this->onQueue(Queues::SCHEDULED_NFTS);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (! config('dashbrd.features.activities') || ! $this->collection->indexesActivities()) {
            return;
        }

        $nfts = $this->collection
                        ->nfts()
                        ->whereIn('token_number', $this->activity->map->tokenId)
                        ->get();

        if ($nfts->contains->isBurned()) {
            report(new RuntimeException(
                "There are some NFTs that have been previously burned, yet we got another LABEL_BURN event for them. IDs: ".$nfts->filter->isBurned()->pluck('id')->join(',')
            ));
        }

        $activity = $this->activity->unique('tokenId')->keyBy('tokenId');

        DB::transaction(function () use ($nfts, $activity) {
            $nfts->each(fn ($nft) => $nft->update([
                'burned_at' => $activity[$nft->token_number]->timestamp,
            ]));
        }, attempts: 3);
    }

    public function retryUntil(): DateTime
    {
        // This job only runs database queries, so we don't expect it to fail... However, let's give it some time to run, so we are covered.

        return now()->addHours(1);
    }
}
