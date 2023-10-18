<?php

namespace App\Jobs;

use App\Enums\Chains;
use App\Models\Collection;
use App\Models\Token;
use App\Support\Queues;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UpdateNftActivityNativeBalance implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // 1. Get all collections where network_id = 137
        $collections = Collection::query()
                                 ->where('network_id', Chains::Polygon->value)
                                 ->get();

        // Grab the ETH token regardless of the chain, because always want to report prices in ETH...
        $ethToken = Token::query()
                    ->whereHas('network', fn ($query) => $query->where('chain_id', Chains::ETH->value))
                    ->where('is_native_token', true)
                    ->firstOrFail();

        // 2. Get all activities for each collection
        foreach ($collections as $collection) {
            $activities = $collection->activities();

            foreach ($activities as $activity) {
                // 3. For each activity, check if extra_attributes is not null
                if ($activity->extra_attributes !== null) {
                    $extraAttributes = json_decode($activity->extra_attributes);

                    if (isset($extraAttributes->recipientPaid)) {
                        // 4. In extra_attributes, check if `recipientPaid` is not empty. If it isn't empty, get totalNative
                        $totalNative = $extraAttributes->recipientPaid;

                        // 5. Get timestamp from activity and calculate the value based on the date in token_price_history
                        $timestamp = $activity->timestamp;



                        // 6. Store the value in the activity (totalNative, totalUsd)
                    }
                }
            }
        }

    }
}
