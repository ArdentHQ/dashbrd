<?php

declare(strict_types=1);

namespace App\Providers;

use App\Contracts\MarketDataProvider;
use App\Contracts\TextToSpeechProvider;
use App\Contracts\Web3DataProvider;
use App\Jobs\RefreshNftMetadata;
use App\Services\MarketData\Providers\CoingeckoProvider;
use App\Services\TextToSpeech\Polly;
use App\Services\Web3\Web3ProviderFactory;
use Aws\Polly\PollyClient;
use Aws\S3\S3Client;
use Exception;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(MarketDataProvider::class, static function () {
            $service = config('services.marketdata.provider');

            if ($service === 'coingecko') {
                return new CoingeckoProvider();
            }

            if ($service === 'coinmarketcap') {
                throw new Exception('CoinMarketCap is not supported yet.');
            }

            throw new Exception('Unknown market data provider.');
        });

        $this->app->singleton(
            Web3DataProvider::class,
            static fn ($app) => Web3ProviderFactory::create($app['config']['dashbrd.web3_providers.default'])
        );

        $this->app->bind(TextToSpeechProvider::class, Polly::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // `$type` needs to be an instance of ToastType. However, adding that makes PHPStan fail with Internal Error...
        // Make sure to check this from time to time if this has been fixed... We'd much more prefer to have an enum instead of string..
        RedirectResponse::macro('toast', function (string $message, string $type = 'info', bool $expanded = false, bool $loading = false) {
            /** @var RedirectResponse $this */
            return $this->with('toast:message', $message)
                ->with('toast:type', $type)
                ->with('toast:expanded', $expanded)
                ->with('toast:loading', $loading);
        });

        Request::macro('wallet', function () {
            /** @var Request $this */
            return $this->user()?->wallet ?? null;
        });

        RateLimiter::for('nft-refresh', function ($job) {
            if ($job instanceof RefreshNftMetadata) {
                return [
                    // too many refreshes per minute (globally) are sus
                    Limit::perMinute(config('dashbrd.collections.throttle.nft_refresh.total_jobs_per_minute', 50)),
                    // individual limit by nft
                    Limit::perMinutes(
                        config('dashbrd.collections.throttle.nft_refresh.job_per_nft_every_minutes', 15),
                        1,
                    ),
                ];
            }

            return Limit::none();
        });

        $this->app->bind(S3Client::class, static function ($app) {
            return new S3Client([
                'version' => 'latest',
                'region' => $app['config']->get('services.polly.region'),
                'credentials' => [
                    'key' => $app['config']->get('services.polly.key'),
                    'secret' => $app['config']->get('services.polly.secret'),
                ],
            ]);
        });

        $this->app->bind(PollyClient::class, static function ($app) {
            return new PollyClient([
                'version' => 'latest',
                'region' => $app['config']->get('services.polly.region'),
                'credentials' => [
                    'key' => $app['config']->get('services.polly.key'),
                    'secret' => $app['config']->get('services.polly.secret'),
                ],
            ]);
        });
    }
}
