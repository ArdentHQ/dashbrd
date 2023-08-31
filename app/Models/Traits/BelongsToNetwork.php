<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Models\Network;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToNetwork
{
    /**
     * @return BelongsTo<Network, self>
     */
    public function network(): BelongsTo
    {
        return $this->belongsTo(Network::class);
    }
}
