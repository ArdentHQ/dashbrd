<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollectionVote extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id',
        'voted_at',
    ];

    protected $timestamps = false;

    protected $casts = [
        'voted_at' => 'datetime',
    ];

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeinCurrentMonth(Builder $query): Builder
    {
        return $query->whereBetween('voted_at', [
            Carbon::now()->startOfMonth(),
            Carbon::now()->endOfMonth(),
        ]);
    }
}
