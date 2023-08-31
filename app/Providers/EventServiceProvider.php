<?php

declare(strict_types=1);

namespace App\Providers;

use App\Events\WalletBecameActive;
use App\Listeners\WalletBecameActiveListener;
use App\Models\CoingeckoToken;
use App\Models\SpamToken;
use App\Models\Token;
use App\Observers\CoingeckoTokenObserver;
use App\Observers\SpamTokenObserver;
use App\Observers\TokenObserver;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [],
        WalletBecameActive::class => [
            WalletBecameActiveListener::class,
        ],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        Token::observe(TokenObserver::class);
        CoingeckoToken::observe(CoingeckoTokenObserver::class);
        SpamToken::observe(SpamTokenObserver::class);
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     *
     * @return bool
     */
    public function shouldDiscoverEvents()
    {
        return false;
    }
}
