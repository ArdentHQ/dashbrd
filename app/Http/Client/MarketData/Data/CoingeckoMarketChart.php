<?php

declare(strict_types=1);

namespace App\Http\Client\MarketData\Data;

class CoingeckoMarketChart
{
    /**
     * @see https://www.coingecko.com/api/documentations/v3#/coins/get_coins__id__market_chart
     *
     * @param array{
     *   prices: array<int, array<int, float>>,
     *   market_caps: array<int, array<int, int>>,
     * } $responseData
     */
    public function __construct(private array $responseData)
    {
    }

    /**
     * @return array<int, array<int, float>>
     */
    public function prices(): array
    {
        return $this->responseData['prices'];
    }
}
