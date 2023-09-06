<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Data\AuthData;
use App\Data\Token\TokenData;
use App\Data\UserData;
use App\Data\Wallet\WalletData;
use App\Models\Report;
use App\Models\Token;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Inertia\Middleware;
use Laravel\Pennant\Feature;
use Tightenco\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        /** @var User|null $user */
        $user = $request->user();

        $wallet = $user?->wallet;

        /** @var UserData|null */
        $userData = $user?->getData();
        /** @var WalletData|null */
        $walletData = $wallet?->getData();

        return array_merge(parent::share($request), [
            'environment' => App::environment(),
            'testingWallet' => app()->environment('testing_e2e') ? config('dashbrd.testing_wallet') : null,
            'auth' => fn () => new AuthData(
                $userData,
                $walletData,
                $user !== null,
            ),
            'allowsGuests' => false,
            'features' => Feature::all(),
            'reportReasons' => Report::reasons(),
            'allowedExternalDomains' => config('dashbrd.allowed_external_domains'),
            'maticToken' => TokenData::from(Token::matic()->firstOrFail()),
            'ziggy' => function () use ($request) {
                return array_merge((new Ziggy)->toArray(), [
                    'location' => $request->url(),
                ]);
            },
            'toast' => [
                'message' => fn () => $request->session()->get('toast:message'),
                'type' => fn () => $request->session()->get('toast:type'),
                'expanded' => fn () => $request->session()->get('toast:expanded', false),
                'isLoading' => fn () => $request->session()->get('toast:loading', false),
            ],
        ]);
    }
}
