<?php

declare(strict_types=1);

namespace App\Http\Client\MarketData;

use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Http\Client\MarketData\Data\CoingeckoMarketChart;
use App\Http\Client\MarketData\Data\CoingeckoTokenData;
use App\Http\Client\MarketData\Data\CoingeckoTokens;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ServerException;
use GuzzleHttp\Promise\Promise;
use Illuminate\Http\Client\ConnectionException as LaravelConnectionException;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Collection;
use Throwable;

class CoingeckoPendingRequest extends PendingRequest
{
    protected string $apiUrl;

    /**
     * Create a new HTTP Client instance.
     *
     * @return void
     */
    public function __construct(Factory $factory = null)
    {
        parent::__construct($factory);

        $this->apiUrl = config('services.coingecko.endpoint');

        $this->options = [
            'headers' => [
                'Accepts' => 'application/json',
            ],
        ];

        if ($key = config('services.coingecko.key')) {
            $this->options['headers']['x-cg-pro-api-key'] = $key;
        }

        $this->client = new Client([
            'handler' => $this->buildHandlerStack(),
            'timeout' => config('services.coingecko.http.timeout'),
        ]);
    }

    /**
     * Send the request to the given URL.
     *
     *
     * @param  array<mixed>  $options
     *
     * @throws \Exception
     */
    public function send(string $method, string $path, array $options = []): Response|Promise
    {
        $url = $this->apiUrl.$path;

        try {
            return parent::send($method, $url, $options);
        } catch (Throwable $e) {
            if ($e instanceof LaravelConnectionException || $e instanceof ServerException) {
                throw new ConnectionException('Coingecko', $url, $e->getCode());
            }

            if ($e instanceof ClientException && $e->getCode() === 429) {
                $retryAfter = $e->getResponse()->getHeader('Retry-After')[0] ?? 30;

                throw new RateLimitException((int) $retryAfter);
            }

            throw $e;
        }
    }

    public function tokens(): CoingeckoTokens
    {
        /**
         * @var array<int, array{id: string, symbol: string, name: string, platforms: array<string, string>}> $tokens
         */
        $tokens = self::get('coins/list', ['include_platform' => 'true'])->json();

        return new CoingeckoTokens($tokens);
    }

    /**
     * @return array<string>
     */
    public function topTokenIds(int $perPage = 1000, int $page = 1): array
    {
        /**
         * @var array<int, array{id: string }> $tokens
         */
        $tokens = self::get('coins/markets', [
            'vs_currency' => 'usd',
            'order' => 'market_cap_desc',
            'per_page' => $perPage,
            'page' => $page,
        ])->json();

        return array_map(fn ($token) => $token['id'], $tokens);
    }

    public function token(string $id): ?CoingeckoTokenData
    {
        try {
            return new CoingeckoTokenData(self::get('coins/'.$id, [
                'localization' => false,
                'tickers' => true,
                'community_data' => false,
                'developer_data' => false,
            ])->json());
        } catch (ClientException $clientException) {
            if ($clientException->getCode() === 404) {
                return null;
            }

            throw $clientException;
        }
    }

    // https://www.coingecko.com/api/documentations/v3#/coins/get_coins__id__market_chart
    public function marketChart(string $id, string $vsCurrency, int $days): CoingeckoMarketChart
    {
        return new CoingeckoMarketChart(self::get('coins/'.$id.'/market_chart', [
            'vs_currency' => $vsCurrency,
            'days' => $days,
        ])->json());
    }

    /**
     * @param  string[]  $ids
     * @return Collection<int, CoingeckoMarketChart|null>
     */
    public function marketChartBatch(array $ids, string $vsCurrency, int $days): Collection
    {
        $responses = self::pool(fn (Pool $pool) => array_map(fn (string $id) => $pool->get(
            'coins/'.$id.'/market_chart', [
                'vs_currency' => $vsCurrency,
                'days' => $days,
            ]
        ), $ids));

        return collect($responses)
            ->map(function (Response $response) {
                if ($response->failed()) {
                    return null;
                }

                return new CoingeckoMarketChart($response->json());
            });
    }

    /**
     * @return string[]
     */
    public function currencies(): array
    {
        return array_map(static fn ($currency) => strtoupper($currency), self::get('simple/supported_vs_currencies')->json());
    }
}
