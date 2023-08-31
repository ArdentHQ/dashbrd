<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Laravel\Horizon\HorizonApplicationServiceProvider;

class HorizonServiceProvider extends HorizonApplicationServiceProvider
{
    /**
     * Register the Horizon gate.
     *
     * This gate determines who can access Horizon in non-local environments.
     */
    protected function gate(): void
    {
        Gate::define('viewHorizon', static function (User $user) {
            if (app()->environment('testing_e2e')) {
                return true;
            }

            $userIds = explode(',', config('horizon.authorized_user_ids', ''));

            return in_array($user->id, $userIds);
        });
    }
}
