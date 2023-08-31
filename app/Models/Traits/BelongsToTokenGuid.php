<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Models\TokenGuid;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTokenGuid
{
    /**
     * @return BelongsTo<TokenGuid, self>
     */
    public function tokenGuid(): BelongsTo
    {
        return $this->belongsTo(TokenGuid::class, 'token_guid', 'id');
    }
}
