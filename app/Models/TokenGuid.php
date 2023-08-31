<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TokenGuid extends Model
{
    use HasFactory;

    public $timestamps = false;

    /**
     * @var array<string>
     */
    protected $fillable = [
        'address',
        'network_id',
        'guid',
    ];
}
