<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Models\Wallet;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToWallet
{
    /**
     * @return BelongsTo<Wallet, self>
     */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }
}
