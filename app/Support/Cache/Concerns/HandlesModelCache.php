<?php

declare(strict_types=1);

namespace App\Support\Cache\Concerns;

use Closure;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

trait HandlesModelCache
{
    public static function from(mixed $model): self
    {
        return new self($model);
    }

    /**
     * @template TCacheValue
     *
     * @param  \Closure(): TCacheValue  $callback
     * @param  string[]  $tags
     * @return TCacheValue
     */
    protected function fromCache(Closure $callback, string $cacheKey, array $tags = [])
    {
        return Cache::tags([self::tag(), ...$tags])->rememberForever($cacheKey, $callback);
    }

    protected static function clearCache(string $cacheKey): void
    {
        Cache::tags([self::tag()])->forget($cacheKey);
    }

    /**
     * @param  int|string|array<string|int>  $uniqueKeyParts
     */
    protected static function getCacheKey(int|array|string $uniqueKeyParts): string
    {
        return implode('-', Arr::wrap($uniqueKeyParts));
    }

    protected static function tag(): string
    {
        return constant(self::class.'::TAG_MAIN');
    }
}
