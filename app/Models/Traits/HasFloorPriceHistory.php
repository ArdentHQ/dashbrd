<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Models\FloorPriceHistory;
use Illuminate\Database\Eloquent\Relations\HasMany;

trait HasFloorPriceHistory
{
    /**
     * @return HasMany<FloorPriceHistory>
     */
    public function floorPriceHistory(): HasMany
    {
        return $this->hasMany(FloorPriceHistory::class);
    }
}
