<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Collection;
use App\Models\Gallery;
use App\Models\Nft;
use Carbon\Carbon;
use Illuminate\Cache\RateLimiter as CacheRateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;

class RateLimiterHelpers
{
    public static function galleryReportAvailableInHumanReadable(Request $request, Gallery $gallery): ?string
    {
        $limiters = (new GalleryRateLimiter($gallery, $request->user()?->id, $request->ip()))->__invoke();

        return self::availableInHumanReadableLimits($limiters, 'gallery:reports');
    }

    public static function collectionReportAvailableInHumanReadable(Request $request, Collection $collection): ?string
    {
        $limiters = (new CollectionRateLimiter($collection, $request->user()?->id, $request->ip()))->__invoke();

        return self::availableInHumanReadableLimits($limiters, 'collection:reports');
    }

    public static function nftReportAvailableInHumanReadable(Request $request, Nft $nft): ?string
    {
        $limiters = (new NftRateLimiter($nft, $request->user()?->id, $request->ip()))->__invoke();

        return self::availableInHumanReadableLimits($limiters, 'nft:reports');
    }

    /**
     * @param  Limit[]  $limits
     */
    private static function availableInHumanReadableLimits(array $limits, string $limiterKey): ?string
    {
        $limiter = app(CacheRateLimiter::class);

        foreach ($limits as $limit) {
            $limitKey = self::buildLimiterKey($limiterKey, $limit);

            if ($limiter->tooManyAttempts($limitKey, $limit->maxAttempts)) {
                $availableIn = $limiter->availableIn(md5($limiterKey.$limit->key));

                return self::availableInHumanReadable($availableIn);
            }
        }

        return null;
    }

    public static function availableInHumanReadable(int $retryAfterSeconds): string
    {
        $retryAfterHours = Carbon::now()->addSeconds($retryAfterSeconds)->diffInHours();

        if ($retryAfterHours >= 1) {
            $availableIn = trans_choice('common.n_hours', $retryAfterHours, ['count' => $retryAfterHours]);
        } else {
            $retryAfterMinutes = Carbon::now()->addSeconds($retryAfterSeconds)->diffInMinutes();
            $availableIn = trans_choice('common.n_minutes', $retryAfterMinutes, ['count' => $retryAfterMinutes]);
        }

        return $availableIn;
    }

    /**
     * Builds the key using the `md5` function as the `ThrottleRequests`
     * middleware does.
     *
     * @see `vendor/laravel/framework/src/Illuminate/Routing/Middleware/ThrottleRequests.php@handleRequestUsingNamedLimiter`
     */
    private static function buildLimiterKey(string $limiterKey, Limit $limit): string
    {
        return md5($limiterKey.$limit->key);
    }
}
