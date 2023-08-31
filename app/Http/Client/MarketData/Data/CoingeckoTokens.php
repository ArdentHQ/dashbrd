<?php

declare(strict_types=1);

namespace App\Http\Client\MarketData\Data;

use Illuminate\Support\Arr;

class CoingeckoTokens
{
    /**
     * @param  array<int, array{id: string, symbol: string, name: string, platforms: array<string, string>}>  $responseData
     */
    public function __construct(private array $responseData)
    {
        //
    }

    /**
     * @return array<int, array{symbol: string, name: string, coingecko_id: string, platforms: string}>
     */
    public function list(): array
    {
        return array_map(fn ($token) => $this->mapToken($token), $this->responseData);
    }

    /**
     * @param  array{id: string, symbol: string, name: string, platforms: array<string, string>}  $token
     * @return array{symbol: string, name: string, coingecko_id: string, platforms: string}
     */
    private function mapToken(array $token): array
    {
        /** @var array<string, string> $tokenPlatforms */
        $tokenPlatforms = Arr::get($token, 'platforms', []);
        $platforms = collect($tokenPlatforms)
            ->filter(fn (?string $key) => $key !== null && $key !== '')
            ->toArray();

        return [
            'symbol' => $token['symbol'],
            'name' => $token['name'],
            'coingecko_id' => $token['id'],
            'platforms' => strval(json_encode($platforms)),
        ];
    }
}
