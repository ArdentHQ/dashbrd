<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FloorPriceHistory extends Model
{
    use HasFactory;

    /**
     * @var string
     */
    protected $table = 'floor_price_history';

    /**
     * @var array<string>
     */
    protected $fillable = [
        'collection_id',
        'floor_price',
    ];
}
