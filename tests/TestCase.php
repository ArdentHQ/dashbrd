<?php

declare(strict_types=1);

namespace Tests;

use App\Jobs\FetchCollectionBanner;
use App\Jobs\FetchCollectionFloorPrice;
use App\Jobs\FetchCollectionTraits;
use App\Jobs\FetchEnsDetails;
use App\Jobs\FetchNativeBalances;
use App\Jobs\FetchTokens;
use App\Jobs\FetchUserNfts;
use App\Jobs\FetchWalletNfts;
use App\Support\Facades\Alchemy;
use App\Support\Facades\Coingecko;
use App\Support\Facades\Mnemonic;
use App\Support\Facades\Moralis;
use Database\Seeders\NetworkSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        Http::preventStrayRequests();
        Coingecko::preventStrayRequests();
        Alchemy::preventStrayRequests();
        Moralis::preventStrayRequests();
        Mnemonic::preventStrayRequests();

        // These ensure that tests run fast
        Config::set('services.coingecko.retryDelay', 1);
        Config::set('services.alchemy.retryDelay', 1);
        Config::set('services.moralis.retryDelay', 1);
        Config::set('services.mnemonic.retryDelay', 1);

        Notification::fake();

        // Some API response fixtures rely on the Polygon network being present in the database instead
        // of made up ones.
        $this->seed(NetworkSeeder::class);

        Bus::fake([
            FetchTokens::class,
            FetchUserNfts::class,
            FetchWalletNfts::class,
            FetchCollectionBanner::class,
            FetchCollectionFloorPrice::class,
            FetchCollectionTraits::class,
            FetchNativeBalances::class,
            FetchEnsDetails::class,
        ]);

        Cache::flush();
    }
}
