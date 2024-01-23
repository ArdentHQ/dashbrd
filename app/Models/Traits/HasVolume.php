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
use Illuminate\Support\Facades\DB;

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
     * Calculate the total collection volume since the given time period.
     */
    public function totalVolumeSince(Carbon $date): string
    {
        return $this->volumes()
                    ->selectRaw('sum(volume::numeric) as total')
                    ->where('created_at', '>=', $date->startOfDay())
                    ->value('total') ?? '0';
    }

    /**
     * Get the collection volume, but respecting the volume in the given period.
     * If no period is provided, get the total collection volume.
     */
    public function getVolume(?Period $period = null): ?string
    {
        return match ($period) {
            Period::DAY => $this->volume_1d,
            Period::WEEK => $this->volume_7d,
            Period::MONTH => $this->volume_30d,
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
    public function scopeOrderByVolume(Builder $query, ?Period $period = null, ?CurrencyCode $currency = null): Builder
    {
        $column = match ($period) {
            Period::DAY => 'volume_1d::numeric',
            Period::WEEK => 'volume_7d::numeric',
            Period::MONTH => 'volume_30d::numeric',
            default => 'total_volume::numeric',
        };

        // If no currency is passed, we'll order by the WEI value...
        if ($currency === null) {
            return $query->orderByWithNulls($column, 'desc');
        }

        $subselect = DB::raw("(min(native_token.extra_attributes->'market_data'->'current_prices'->>'{$currency->canonical()}')::numeric * {$column} / (10 ^ max(native_token.decimals))) as volume_fiat");

        return $query
                    ->addSelect('collections.*')
                    ->leftJoin(
                        'tokens as native_token',
                        fn ($join) => $join->on('native_token.network_id', '=', 'collections.network_id')->where('is_native_token', true)
                    )
                    ->addSelect($subselect)
                    ->groupBy('collections.id')
                    ->orderByWithNulls('volume_fiat', 'desc');
    }
}
