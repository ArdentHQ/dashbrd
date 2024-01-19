<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Models\Network;
use App\Models\Token;
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

    public function nativeToken(): Token
    {
        return $this->network->nativeToken;
    }
}
