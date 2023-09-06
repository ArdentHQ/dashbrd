<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\TraitDisplayType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;
use Spatie\LaravelData\WithData;

/**
 * @property NftTrait $pivot
 */
class CollectionTrait extends Model
{
    use WithData, HasFactory;

    protected $fillable = [
        'collection_id',
        'name',
        'value',
        'display_type',
        'value_min',
        'value_max',
        'nfts_percentage',
        'nfts_count',
    ];

    protected $casts = [
        'value_min' => 'float',
        'value_max' => 'float',
        'nfts_percentage' => 'float',
    ];

    /**
     * @return BelongsToMany<Nft>
     */
    public function nfts(): BelongsToMany
    {
        return $this->belongsToMany(Nft::class, 'nft_trait', 'trait_id');
    }

    /**
     * @return array<string, string>
     */
    public static function explodeValueTypeColumns(TraitDisplayType $displayType, string $value): array
    {
        $valueColumns = $displayType->getValueColumns($value);

        return collect(['value_string', 'value_numeric', 'value_date'])
            ->mapWithKeys(fn ($k, $index) => [$k => $valueColumns[$index]])->toArray();
    }

    public static function isValidValue(?string $traitValue): bool
    {
        if (empty($traitValue)) {
            return true;
        }

        if (Str::length($traitValue) <= config('dashbrd.trait_value_max_length')) {
            return true;
        }

        return false;
    }
}
