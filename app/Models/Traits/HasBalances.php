<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Models\Balance;
use Illuminate\Database\Eloquent\Relations\HasMany;

trait HasBalances
{
    /**
     * @return HasMany<Balance>
     */
    public function balances(): HasMany
    {
        return $this->hasMany(Balance::class);
    }
}
