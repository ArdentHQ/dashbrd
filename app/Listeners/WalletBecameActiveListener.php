<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\WalletBecameActive;
use App\Models\Network;

class WalletBecameActiveListener
{
    /**
     * Handle the event.
     */
    public function handle(WalletBecameActive $event): void
    {
        $wallet = $event->wallet;

        // The last activity is null the first time a wallet is created; if so then try to process the jobs
        // as fast as possible to ensure a smooth user experience.

        // TODO: we might want to also consider doing this for returning wallets? (e.g. inactive for > x days)
        $isPriority = $wallet->last_activity_at === null;

        Network::onlyActive()->get()->each(function ($network) use ($wallet, $isPriority) {
            $wallet->dispatchIndexingJobs($network, onPriorityQueue: $isPriority);
        });
    }
}
