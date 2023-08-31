<?php

declare(strict_types=1);

namespace App\Support\Facades;

use App\Http\Client\MarketData\CoingeckoFactory;
use App\Http\Client\MarketData\Data\CoingeckoMarketChart;
use App\Http\Client\MarketData\Data\CoingeckoTokenData;
use App\Http\Client\MarketData\Data\CoingeckoTokens;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

/**
 * @method static CoingeckoTokens tokens()
 * @method static CoingeckoTokenData | null token(string $id)
 * @method static string[] currencies()
 * @method static string[] topTokenIds(int $perPage = 250, int $page = 1)
 * @method static CoingeckoMarketChart marketChart(string $id, string $vsCurrency, int $days)
 * @method static Collection<int, CoingeckoMarketChart|null> marketChartBatch(array $ids, string $vsCurrency, int $days)
 *
 * @see \App\Http\Client\MarketData\CoingeckoPendingRequest
 */
class Coingecko extends Http
{
    protected static function getFacadeAccessor(): string
    {
        return CoingeckoFactory::class;
    }
}
