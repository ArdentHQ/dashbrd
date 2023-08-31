<?php

declare(strict_types=1);

namespace App\Providers;

use App\Enums\Features;
use Illuminate\Http\Response;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

class FeaturesServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::define(Features::Portfolio->value, config('dashbrd.features.portfolio'));
        Feature::define(Features::Galleries->value, config('dashbrd.features.galleries'));
        Feature::define(Features::Collections->value, config('dashbrd.features.collections'));
    }

    public function register(): void
    {
        EnsureFeaturesAreActive::whenInactive(
            static fn () => abort(Response::HTTP_NOT_FOUND)
        );
    }
}
