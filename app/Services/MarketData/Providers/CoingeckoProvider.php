<?php

declare(strict_types=1);

namespace App\Services\MarketData\Providers;

use App\Contracts\MarketDataProvider;
use App\Data\PriceHistoryData;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Enums\Platforms;
use App\Enums\Service;
use App\Http\Client\MarketData\Data\CoingeckoTokenData;
use App\Http\Client\MarketData\Data\CoingeckoTokens;
use App\Jobs\Middleware\RateLimited;
use App\Models\CoingeckoToken;
use App\Models\Token;
use App\Services\Traits\LoadsFromCache;
use App\Support\DataSampler;
use App\Support\Facades\Coingecko;
use Illuminate\Support\Collection;
use InvalidArgumentException;
use Spatie\LaravelData\DataCollection;

class CoingeckoProvider implements MarketDataProvider
{
    use LoadsFromCache;

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
    public function getTokenDetails(Token $token): ?array
    {
        $token = CoingeckoToken::lookupByToken($token, withTrashed: true);

        if ($token === null) {
            return null;
        }

        $data = Coingecko::token($token->coingecko_id);

        if ($data === null) {
            // null means Coingecko returned 404, so we mark ours as soft deleted
            $token->delete();

            return null;
        }

        if ($token->trashed()) {
            $token->restore();
        }

        return [
            'guid' => $token->coingecko_id,
            'market_data' => [
                'ath' => $data->ath(),
                'atl' => $data->atl(),
                'current_prices' => $data->currentPrices(),
                'total_volume' => $data->totalVolumes(),
                'market_cap' => $data->marketCaps(),
                'price_change_24h_in_currency' => $data->priceChange24hInCurrency(),
                'minted_supply' => $data->mintedSupply(),
            ],
            'images' => $data->images(),
            'socials' => [
                'website' => $data->websiteUrl(),
                'twitter' => $data->twitterUsername(),
                'discord' => $data->discordUrl(),
            ],
        ];
    }

    public function token(string $id): ?CoingeckoTokenData
    {
        return Coingecko::token($id);
    }

    /**
     * @return string[]
     */
    public function topTokenIds(int $perPage = 250, int $page = 1): array
    {
        return Coingecko::topTokenIds($perPage, $page);
    }

    /**
     * @return string[]
     */
    public function getCurrencies(): array
    {
        return Coingecko::currencies();
    }

    /**
     * Note: Consider that the timestamp is in unix milliseconds.
     *
     * @return DataCollection<int, PriceHistoryData>
     */
    public function getPriceHistory(Token $token, CurrencyCode $currency, Period $period, int $sampleCount = null): DataCollection
    {
        $coingeckoId = $this->lookupCoingeckoTokenId($token);

        $priceHistory = $this->fromCache(
            callback: fn () => $this->fetchPriceHistory($coingeckoId, $currency, $period),
            uniqueKeyParts: [$coingeckoId, $currency->value, $period->value],
            ttl: config(sprintf('dashbrd.cache_ttl.coingecko.getPriceHistory.%s', $period->value)),
        );

        /**
         * @var array<int, array{timestamp: int, price: float}> $priceHistory
         */
        if ($sampleCount !== null) {
            return PriceHistoryData::collection(DataSampler::sample($priceHistory, $sampleCount));
        }

        return PriceHistoryData::collection($priceHistory);
    }

    /**
     * Note: Consider that the timestamp is in unix milliseconds.
     *
     * @param  Collection<int, Token>  $tokens
     * @return Collection<string, DataCollection<int, PriceHistoryData>>
     */
    public function getBatchPriceHistory(Collection $tokens, CurrencyCode $currency, Period $period, int $sampleCount = null): Collection
    {
        $tokensWithCoingeckoIds = $this->getTokensWithCoingeckoId($tokens);

        $groupedPriceHistory = $this->fromCache(
            callback: fn () => $this->fetchBatchPriceHistory($tokensWithCoingeckoIds, $currency, $period),
            uniqueKeyParts: [$currency->value, $period->value],
            ttl: config(sprintf('dashbrd.cache_ttl.coingecko.getPriceHistory.%s', $period->value)),
        );

        $missingTokens = $tokensWithCoingeckoIds->filter(fn (Token $token) => $groupedPriceHistory->keys()->doesntContain($token->symbol));

        if ($missingTokens->count()) {
            $groupedPriceHistory = $this->fromCache(
                callback: fn () => $groupedPriceHistory->merge($this->fetchBatchPriceHistory($missingTokens, $currency, $period)),
                uniqueKeyParts: [$currency->value, $period->value],
                ttl: config(sprintf('dashbrd.cache_ttl.coingecko.getPriceHistory.%s', $period->value)),
                ignoreCache: true
            );
        }

        $symbols = $tokens->pluck('symbol');

        if ($sampleCount !== null) {
            return $groupedPriceHistory
                ->filter(fn ($data, $symbol) => $symbols->contains($symbol))
                ->map(
                    fn (array $priceHistory) => PriceHistoryData::collection(DataSampler::sample($priceHistory, $sampleCount)),
                );
        }

        return $groupedPriceHistory
            ->filter(fn ($data, $symbol) => $symbols->contains($symbol))
            ->map(fn (array $priceHistory) => PriceHistoryData::collection($priceHistory));
    }

    /**
     * Gets the complete token list from Coingecko.
     *
     * @return array<int, array{id: string, symbol: string, name: string, platforms: string}>
     */
    public function fetchTokens(): array
    {
        $tokens = Coingecko::tokens();

        return $this->filterTokens($tokens);
    }

    /**
     * Get the middleware to be used for jobs.
     *
     * @return array<int, object>
     */
    public function getJobMiddleware(): array
    {
        return [new RateLimited(Service::Coingecko)];
    }

    /**
     * @return array<int, array{timestamp: int, price: float}>
     */
    private function fetchPriceHistory(string $coingeckoId, CurrencyCode $currency, Period $period): array
    {
        $prices = Coingecko::marketChart(
            id: $coingeckoId,
            vsCurrency: $currency->value,
            days: Period::days($period),
        )->prices();

        return $this->formatPriceHistory($prices);
    }

    /**
     * @param  Collection<string, Token>  $tokensWithCoingeckoIds
     * @return Collection<string, array<int, array{timestamp: int, price: float}>>
     */
    private function fetchBatchPriceHistory(Collection $tokensWithCoingeckoIds, CurrencyCode $currency, Period $period): Collection
    {
        $responses = Coingecko::marketChartBatch(
            ids: $tokensWithCoingeckoIds->keys()->toArray(),
            vsCurrency: $currency->value,
            days: Period::days($period),
        );

        /** @var Collection<string, array<int, array{timestamp: int, price: float}>> */
        return $tokensWithCoingeckoIds
            ->values()
            ->mapWithKeys(function (Token $token, int $index) use ($responses) {
                $data = $responses[$index];

                if ($data === null) {
                    return [
                        $token->symbol => null,
                    ];
                }

                return [
                    $token->symbol => $this->formatPriceHistory($data->prices()),
                ];
            })->filter();
    }

    /**
     * @param  Collection<int, Token>  $tokens
     * @return Collection<string, Token>
     */
    private function getTokensWithCoingeckoId(Collection $tokens)
    {
        return $tokens
            ->mapWithKeys(function (Token $token) {
                $coingeckoTokenId = CoingeckoToken::lookupByToken($token);

                if ($coingeckoTokenId === null) {
                    return [];
                }

                /** @var string */
                $coingeckoId = $coingeckoTokenId['coingecko_id'];

                return [
                    $coingeckoId => $token,
                ];
            })
            ->filter()
            ->collect();
    }

    /**
     * @param  array<int, array<int, float>>  $priceHistory
     * @return array<int, array{timestamp: int, price: float}>
     */
    private function formatPriceHistory(array $priceHistory): array
    {
        return array_map(
            static function ($price) {
                /**
                 * @var array<int, float> $price
                 */
                return [
                    'timestamp' => (int) $price[0],
                    'price' => $price[1],
                ];
            },
            $priceHistory
        );
    }

    private function lookupCoingeckoTokenId(Token $token): string
    {
        $coingeckoToken = CoingeckoToken::lookupByToken($token);

        if ($coingeckoToken === null) {
            throw new InvalidArgumentException('Token ['.$token->symbol.'] does not exist in Coingecko.');
        }

        return $coingeckoToken['coingecko_id'];
    }

    /**
     * @param  CoingeckoTokens  $tokens The complete token list from Coingecko
     * @return array<int, array{id: string, symbol: string, name: string, platforms: string}>
     */
    private function filterTokens(CoingeckoTokens $tokens): array
    {
        /** @var array<int, array{id: string, symbol: string, name: string, platforms: string}> */
        $filteredData = [];

        foreach ($tokens->list() as $token) {
            $tokenPlatforms = json_decode($token['platforms'], true);
            $filteredPlatforms = json_encode(array_intersect_key($tokenPlatforms, array_flip(Platforms::platforms())));

            $filteredData[] = [
                'id' => $token['coingecko_id'],
                'symbol' => $token['symbol'],
                'name' => $token['name'],
                'platforms' => $filteredPlatforms ?: '',
            ];
        }

        return $filteredData;
    }
}
