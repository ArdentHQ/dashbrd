<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;

class FloorPriceHistory extends Model
{
    use HasFactory, MassPrunable;

    /**
     * @var string
     */
    protected $table = 'floor_price_history';

    public $timestamps = false;

    /**
     * @var array<string>
     */
    protected $fillable = [
        'floor_price',
        'token_id',
        'retrieved_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'retrieved_at' => 'datetime',
    ];

    /**
     * @return Builder<FloorPriceHistory>
     */
    public function prunable(): Builder
    {
        return static::where('retrieved_at', '<=', now()->subMonth()->subDay());
    }
}
