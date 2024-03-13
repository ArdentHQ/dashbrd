<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Data\FloorPriceData;
use App\Enums\CurrencyCode;
use App\Models\FloorPriceHistory;
use Brick\Math\BigNumber;
use Brick\Math\RoundingMode;
use Illuminate\Database\Eloquent\Relations\HasMany;
use RuntimeException;

trait HasFloorPriceHistory
{
    /**
     * @return HasMany<FloorPriceHistory>
     */
    public function floorPriceHistory(): HasMany
    {
        return $this->hasMany(FloorPriceHistory::class);
    }

    /**
     * Create a floor price DTO for the collection.
     */
    public function createFloorPriceData(?CurrencyCode $currency = CurrencyCode::USD): FloorPriceData
    {
        $token = $this->floorPriceToken;

        return new FloorPriceData(
            value: $this->floor_price,
            change: $this->relationLoaded('floorPriceHistory') ? $this->floorPriceChange() : null,
            fiat: $this->floor_price !== null ? $token?->toCurrentFiat($this->floor_price, $currency)?->toFloat() : null,
            currency: $token?->symbol ?? 'ETH',
            decimals: $token?->decimals ?? 18,
        );
    }

    /**
     * Get the average floor price for the collection based on all of the loaded history records.
     */
    public function floorPriceChange(): ?float
    {
        if (! $this->relationLoaded('floorPriceHistory')) {
            throw new RuntimeException('Load the floor price history relation for the model before performing calculations.');
        }

        [$today, $yesterday] = $this->floorPriceHistory->partition(fn ($fp) => $fp->retrieved_at->isToday());

        // If there is no yesterday's or today's data, we can't calculate the percentage change...
        if ($yesterday->isEmpty() || $today->isEmpty()) {
            return null;
        }

        $averageToday = BigNumber::sum(
            ...$today->pluck('floor_price')
        )->toBigDecimal()->dividedBy(
            $today->count(), scale: 2, roundingMode: RoundingMode::HALF_UP
        );

        $averageYesterday = BigNumber::sum(
            ...$yesterday->pluck('floor_price')
        )->toBigDecimal()->dividedBy(
            $yesterday->count(), scale: 2, roundingMode: RoundingMode::HALF_UP
        );

        if ($averageYesterday->isZero()) {
            return null;
        }

        return $averageToday->minus($averageYesterday)
                        ->dividedBy($averageYesterday, scale: 2, roundingMode: RoundingMode::HALF_UP)
                        ->multipliedBy(100)
                        ->toFloat();
    }
}
