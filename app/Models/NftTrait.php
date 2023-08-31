<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class NftTrait extends Pivot
{
    protected $table = 'nft_trait';

    protected $fillable = [
        'value_string',
        'value_numeric',
        'value_date',
    ];
}
