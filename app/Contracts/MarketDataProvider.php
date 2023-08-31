<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Data\PriceHistoryData;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Models\Token;
use Illuminate\Support\Collection;
use Spatie\LaravelData\DataCollection;

interface MarketDataProvider
{
    /**
     * @return array{
     *  guid: string,
     *  market_data: array{
     *    ath: array<string, float|null>,
     *    atl: array<string, float|null>,
     *    minted_supply: float|null,
     *    total_volume: array<string, float|null>,
     *    market_cap: array<string, float|null>,
     *  },
     *  images: array{
     *    thumb: string|null,
     *    small: string|null,
     *    large: string|null,
     *  }
     * }|null
     */
    public function getTokenDetails(Token $token): ?array;

    /**
     * @return string[]
     */
    public function getCurrencies(): array;

    /**
     * Get the middleware to be used for jobs.
     *
     * @return array<int, object>
     */
    public function getJobMiddleware(): array;

    /**
     * IMPORTANT: When implementing this method, make sure to set the timestamp
     * for every PriceHistoryData object in the collection in Unix milliseconds
     *
     * @param  int|null  $sampleCount The max number of samples to return. If null, all samples will be returned.
     * @return DataCollection<int, PriceHistoryData>
     */
    public function getPriceHistory(Token $token, CurrencyCode $currency, Period $period, int $sampleCount = null): DataCollection;

    /**
     * IMPORTANT: When implementing this method, make sure to set the timestamp
     * for every PriceHistoryData object in the collection in Unix milliseconds
     *
     * @param  Collection<int, Token>  $tokens
     * @param  int|null  $sampleCount The max number of samples to return. If null, all samples will be returned.
     * @return Collection<string, DataCollection<int, PriceHistoryData>>
     */
    public function getBatchPriceHistory(Collection $tokens, CurrencyCode $currency, Period $period, int $sampleCount = null): Collection;
}
