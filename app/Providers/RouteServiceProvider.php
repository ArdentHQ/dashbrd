<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Collection;
use App\Models\Gallery;
use App\Models\Nft;
use App\Support\CollectionRateLimiter;
use App\Support\GalleryRateLimiter;
use App\Support\NftRateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     *
     * @return void
     */
    public function boot()
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }

    /**
     * Configure the rate limiters for the application.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        RateLimiter::for('api', function (Request $request) {
            $user = $request->user();

            if ($user !== null) {
                return Limit::perMinute(config('dashbrd.api_throttle.user_rate_limit_per_minute'))->by($user->id);
            }

            return Limit::perMinute(config('dashbrd.api_throttle.guest_rate_limit_per_minute'))->by($request->ip());
        });

        RateLimiter::for(
            'collection:reports',
            function (Request $request) {
                $collection = Collection::firstWhere(
                    'address',
                    $request->route()->parameter('collection')
                );

                return (new CollectionRateLimiter($collection, $request->user()?->id, $request->ip()))->__invoke();
            }
        );

        RateLimiter::for(
            'gallery:reports',
            function (Request $request) {
                $gallery = Gallery::firstWhere(
                    $request->route()->bindingFieldFor('gallery'),
                    $request->route()->parameter('gallery')
                );

                return (new GalleryRateLimiter($gallery, $request->user()?->id, $request->ip()))->__invoke();
            }
        );

        RateLimiter::for(
            'nft:reports',
            function (Request $request) {
                $nft = Nft::firstWhere(
                    $request->route()->bindingFieldFor('nft'),
                    $request->route()->parameter('nft')
                );

                return (new NftRateLimiter($nft, $request->user()?->id, $request->ip()))->__invoke();
            }
        );

        RateLimiter::for(
            'nft:refresh',
            function (Request $request) {
                $nft = Nft::firstWhere(
                    $request->route()->bindingFieldFor('nft'),
                    $request->route()->parameter('nft')
                );

                return [
                    Limit::perMinute(config('dashbrd.collections.throttle.nft_refresh.per_user_per_nft_per_minute', 1))
                        ->by('nft:'.$nft->id.':'.($request->userId ?: $request->ip))->response(static fn () => response()->json(['success' => true])),
                ];
            }
        );
    }
}
