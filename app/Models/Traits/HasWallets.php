<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Models\Wallet;
use Illuminate\Database\Eloquent\Relations\HasMany;

trait HasWallets
{
    /**
     * @return HasMany<Wallet>
     */
    public function wallets(): HasMany
    {
        return $this->hasMany(Wallet::class);
    }
}
