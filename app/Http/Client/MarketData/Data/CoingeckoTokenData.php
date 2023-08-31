<?php

declare(strict_types=1);

namespace App\Http\Client\MarketData\Data;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class CoingeckoTokenData
{
    /**
     * @see https://www.coingecko.com/api/documentations/v3#/coins/get_coins__id_
     *
     * @param array{
     *   name: string,
     *   symbol: string,
     *   platformsDetails: array<string, array<string, string>>,
     *   links: array{
     *     twitter_screen_name: string|null,
     *     chat_url: string[],
     *     homepage: string[],
     *   },
     *   market_data: array{
     *     ath: array<string, float>,
     *     atl: array<string, float>,
     *     current_price: array<string, float>,
     *     market_cap: array<string, float>,
     *     total_volume: array<string, float>,
     *     total_supply: float,
     *   },
     * } $responseData
     */
    public function __construct(private array $responseData)
    {
        //
    }

    /**
     * @return array<string, float>
     */
    public function ath(): array
    {
        return $this->responseData['market_data']['ath'];
    }

    /**
     * @return array<string, float>
     */
    public function atl(): array
    {
        return $this->responseData['market_data']['atl'];
    }

    public function mintedSupply(): ?float
    {
        /**
         * @var float|null
         */
        $supply = $this->responseData['market_data']['total_supply'];

        return $supply !== null
                    ? round($supply)
                    : null;
    }

    /**
     * @return array<string, float>
     */
    public function currentPrices(): array
    {
        return Arr::get($this->responseData, 'market_data.current_price', []);
    }

    /**
     * @return array<string, float>
     */
    public function marketCaps(): array
    {
        return $this->responseData['market_data']['market_cap'];
    }

    /**
     * @return array<string, float>
     */
    public function totalVolumes(): array
    {
        return $this->responseData['market_data']['total_volume'];
    }

    /**
     * @return array<string, float>
     */
    public function priceChange24hInCurrency(): array
    {
        return Arr::get($this->responseData, 'market_data.price_change_24h_in_currency', []);
    }

    /**
     * @return array{
     *   thumb: string,
     *   small: string,
     *   large: string,
     * }
     */
    public function images(): array
    {
        return Arr::get($this->responseData, 'image', []);
    }

    public function twitterUsername(): ?string
    {
        $username = $this->responseData['links']['twitter_screen_name'] ?? null;

        if ($username === '') {
            return null;
        }

        return $username;
    }

    public function websiteUrl(): ?string
    {
        $website = collect($this->responseData['links']['homepage'] ?? [])
            ->filter(fn (string $url) => $url !== '')
            ->first();

        if ($website === null) {
            return null;
        }

        return Str::startsWith($website, ['https://', 'http://'])
                    ? $website
                    : Str::start($website, 'https://');
    }

    public function discordUrl(): ?string
    {
        return collect($this->responseData['links']['chat_url'] ?? [])
            ->filter(fn (string $url) => $url !== '')
            ->filter(fn (string $url) => str_starts_with($url, 'https://discord.com') ||
                    str_starts_with($url, 'https://www.discord.com') ||
                    str_starts_with($url, 'https://discord.gg') ||
                    str_starts_with($url, 'https://www.discord.gg')
            )
            ->first();
    }

    public function name(): string
    {
        return $this->responseData['name'];
    }

    public function symbol(): string
    {
        return $this->responseData['symbol'];
    }

    /**
     * @return array<string, mixed>
     */
    public function platformsDetails(): array
    {
        return Arr::get($this->responseData, 'detail_platforms', []);
    }
}
