<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpamToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'token_id',
        'reason',
    ];
}
