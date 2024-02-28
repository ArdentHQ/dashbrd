<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AlchemyWebhookType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlchemyWebhook extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'type' => AlchemyWebhookType::class,
        'addresses' => 'array',
    ];

    /**
     * @return BelongsTo<Network, AlchemyWebhook>
     */
    public function network(): BelongsTo
    {
        return $this->belongsTo(Network::class);
    }
}
