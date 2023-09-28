<?php

declare(strict_types=1);

namespace App\Services\Traits;

use App\Services\MarketData\Providers\CoingeckoProvider;
use App\Services\Web3\Alchemy\AlchemyWeb3DataProvider;
use App\Services\Web3\Fake\FakeWeb3DataProvider;
use App\Services\Web3\Mnemonic\MnemonicWeb3DataProvider;
use App\Services\Web3\Moralis\MoralisWeb3DataProvider;
use Closure;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use InvalidArgumentException;

trait LoadsFromCache
{
    /**
     * @param  string|array<string>  $uniqueKeyParts
     */
    protected function fromCache(Closure $callback, array|string $uniqueKeyParts, int $ttl = null, bool $ignoreCache = false): mixed
    {
        $methodName = $this->getMethodName();

        $ttl = $ttl ?? $this->getCacheExpiration($methodName);

        $key = $this->getCacheKey($uniqueKeyParts);
        $cache = Cache::tags($this->getCacheTags($methodName));

        $value = $cache->get($key);

        if (! is_null($value) && ! $ignoreCache) {
            return $value;
        }

        $value = $callback();

        $cache->put($key, $value, $ttl);

        return $value;
    }

    /**
     * @param  string|array<string>  $uniqueKeyParts
     */
    private function getCacheKey(array|string $uniqueKeyParts): string
    {
        return implode('-', Arr::wrap($uniqueKeyParts));
    }

    /**
     * @return array<string>
     */
    private function getCacheTags(string $methodName): array
    {
        return [
            static::class,
            static::class.'-'.$methodName,
        ];
    }

    private function getCacheExpiration(string $methodName): int
    {
        return (int) config(sprintf(
            'dashbrd.cache_ttl.%s.%s',
            $this->getProviderKey(),
            $methodName,
        ));
    }

    private function getMethodName(): string
    {
        return debug_backtrace()[2]['function'];
    }

    private function getProviderKey(): string
    {
        return match (get_class($this)) {
            AlchemyWeb3DataProvider::class => 'alchemy',
            MoralisWeb3DataProvider::class => 'moralis',
            MnemonicWeb3DataProvider::class => 'mnemonic',
            FakeWeb3DataProvider::class => 'fake',
            CoingeckoProvider::class => 'coingecko',
            default => throw new InvalidArgumentException('No cache key for ['.static::class.'].'),
        };
    }
}
