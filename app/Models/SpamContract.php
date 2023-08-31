<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpamContract extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public static function isSpam(string $address, Network $network): bool
    {
        return SpamContract::query()
            ->where('network_id', $network->id)
            ->where('address', $address)
            ->exists();
    }
}
