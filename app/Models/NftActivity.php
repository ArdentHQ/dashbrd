<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\NftTransferType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\SchemalessAttributes\Casts\SchemalessAttributes;

/** @property string $token_number */
class NftActivity extends Model
{
    use HasFactory;

    protected $table = 'nft_activity';

    /**
     * @var array<string>
     */
    protected $fillable = [
        'type',
        'sender',
        'recipient',
        'tx_hash',
        'timestamp',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'type' => NftTransferType::class,
        'extra_attributes' => SchemalessAttributes::class,
        'timestamp' => 'datetime',
    ];

    /**
     * @return BelongsTo<Nft, NftActivity>
     */
    public function nft(): BelongsTo
    {
        return $this->belongsTo(Nft::class, 'token_number', 'token_number')->when(
            $this->collection_id !== null, fn ($q) => $q->where('collection_id', $this->collection_id)
        );
    }
}
