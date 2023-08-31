<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CurrencyCode;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/** @property float $price */
class TokenPriceHistory extends Model
{
    use HasFactory;

    protected $table = 'token_price_history';

    public $timestamps = false;

    protected $guarded = ['id'];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'timestamp' => 'datetime',
    ];

    public static function getHistory(
        Token $token,
        CurrencyCode $currency,
        Carbon $timestamp
    ): ?TokenPriceHistory {
        // find the price history rows for dates between [date - 1 day, date + 1 day]
        $priceHistory = TokenPriceHistory::query()->where([
            ['token_guid', $token->tokenGuid?->guid],
            ['currency', $currency],
        ])->whereBetween('timestamp', [
            $timestamp->copy()->subDays(1)->startOfDay(),
            $timestamp->copy()->addDays(1)->endOfDay(),
        ])->get();

        // find the nearest date to the given timestamp and return
        return $priceHistory->sortBy(fn ($history) => abs($history->timestamp->diffInSeconds($timestamp)))->first();
    }
}
