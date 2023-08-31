<?php

declare(strict_types=1);

namespace App\Providers;

use App\Enums\DateFormat;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Auth\Web3UserProvider;
use App\Support\Currency;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Auth::provider('web3', static fn ($app, array $config) => new Web3UserProvider($config['model']));

        // If you set your application's environment to `testing_e2e`, we will automatically log in the user that has that wallet.
        // This is done so you can test every aspect of the platform by just updating the environment variable to the address you want to test.
        if ($this->app->environment('testing_e2e') && ! $this->app->runningInConsole() && config('dashbrd.testing_wallet')) {
            $wallet = $this->ensureTestingWalletExists();

            Auth::login($wallet->user);
        }
    }

    private function ensureTestingWalletExists(): Wallet
    {
        $wallet = Wallet::firstWhere('address', config('dashbrd.testing_wallet'));

        if ($wallet !== null) {
            return $wallet;
        }

        return DB::transaction(static function () {
            $user = User::create([
                'extra_attributes' => [
                    'currency' => Currency::find('USD'),
                    'date_format' => DateFormat::D->value,
                    'time_format' => '24',
                    'timezone' => 'UTC',
                ],
            ]);

            $wallet = Wallet::forceCreate([
                'user_id' => $user->id,
                'address' => config('dashbrd.testing_wallet'),
            ]);

            $user->update([
                'wallet_id' => $wallet->id,
            ]);

            return $wallet;
        });
    }
}
