<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property string $balance
 */
class Balance extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id', 'token_id', 'balance',
    ];

    /**
     * @return HasOne<Token>
     */
    public function token(): HasOne
    {
        return $this->hasOne(Token::class, 'id', 'token_id');
    }

    /**
     * @return HasOne<Wallet>
     */
    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class, 'id', 'wallet_id');
    }
}
