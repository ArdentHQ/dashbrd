<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $price
 * @property string $price_change_24h
 */
class TokenPrice extends Model
{
    use HasFactory;

    /**
     * @return BelongsTo<Token, self>
     */
    public function token(): BelongsTo
    {
        return $this->belongsTo(Token::class, 'token_guid', 'token_guid');
    }
}
