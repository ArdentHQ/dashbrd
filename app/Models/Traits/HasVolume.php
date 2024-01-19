<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Data\VolumeData;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Models\TradingVolume;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

trait HasVolume
{
    /**
     * @return HasMany<TradingVolume>
     */
    public function volumes(): HasMany
    {
        return $this->hasMany(TradingVolume::class);
    }

    /**
     * Calculate the average collection volume since the given time period.
     */
    public function averageVolumeSince(Carbon $date): string
    {
        return $this->volumes()
                    ->selectRaw('avg(volume::numeric) as aggregate')
                    ->where('created_at', '>', $date)
                    ->value('aggregate');
    }

    /**
     * Get the collection volume, but respecting the volume in the given period.
     * If no period is provided, get the total collection volume.
     */
    public function getVolume(?Period $period = null): ?string
    {
        return match ($period) {
            Period::DAY => $this->avg_volume_1d,
            Period::WEEK => $this->avg_volume_7d,
            Period::MONTH => $this->avg_volume_30d,
            default => $this->total_volume,
        };
    }

    /**
     * Create a volume DTO based on the volume in the given period.
     */
    public function createVolumeData(Period $period, CurrencyCode $currency): VolumeData
    {
        $volume = $this->getVolume($period);
        $token = $this->nativeToken();

        return new VolumeData(
            value: $volume,
            fiat: $volume !== null ? $token->toCurrentFiat($volume, $currency)?->toFloat() : null,
            currency: $token->symbol,
            decimals: $token->decimals,
        );
    }

    /**
     * Scope the query to order the collections by the volume, but respecting the volume in the given period.
     *
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOrderByVolume(Builder $query, ?Period $period = null): Builder
    {
        $column = match ($period) {
            Period::DAY => 'avg_volume_1d',
            Period::WEEK => 'avg_volume_7d',
            Period::MONTH => 'avg_volume_30d',
            default => 'total_volume',
        };

        return $query->orderByWithNulls($column.'::numeric', 'desc');
    }
}
