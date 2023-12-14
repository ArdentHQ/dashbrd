<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollectionVote extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id',
        'voted_at',
    ];

    public $timestamps = false;

    protected $casts = [
        'voted_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<Wallet, CollectionVote>
     */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * @return BelongsTo<Collection, CollectionVote>
     */
    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeInCurrentMonth(Builder $query): Builder
    {
        return $query->whereBetween('voted_at', [
            Carbon::now()->startOfMonth(),
            Carbon::now()->endOfMonth(),
        ]);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeInPreviousMonth(Builder $query): Builder
    {
        return $query->whereBetween('voted_at', [
            Carbon::now()->subMonth()->startOfMonth(),
            Carbon::now()->subMonth()->endOfMonth(),
        ]);
    }
}
