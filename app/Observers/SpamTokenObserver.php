<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\SpamToken;
use Illuminate\Support\Facades\Log;

class SpamTokenObserver
{
    /**
     * Handle the SpamToken "created" event.
     */
    public function created(SpamToken $token): void
    {
        // We can later adjust this to make use of Sentry as well, once we know more about the rate at which this gets triggered
        Log::debug('SpamToken created for token '.$token->token_id.', reason: '.$token->reason);
    }
}
