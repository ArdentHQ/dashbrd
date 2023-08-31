<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Wallet;
use Illuminate\Queue\SerializesModels;

class WalletBecameActive
{
    use SerializesModels;

    public function __construct(public Wallet $wallet)
    {
        //
    }
}
