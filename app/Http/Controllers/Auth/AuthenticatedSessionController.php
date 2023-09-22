<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Data\AuthData;
use App\Data\UserData;
use App\Data\Wallet\WalletData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\SignMessageRequest;
use App\Http\Requests\Auth\SignRequest;
use App\Models\User;
use App\Support\Facades\Signature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return response()->json([
            'auth' => $this->getAuthData($request)
        ]);
    }

    /**
     * Generate a new signature for verifying the wallet address
     */
    public function signMessage(SignMessageRequest $request): JsonResponse
    {
        return response()->json(['message' => $request->getMessage()]);
    }

    public function sign(SignRequest $request): JsonResponse
    {
        $request->sign();

        return response()->json([
            'auth' => $this->getAuthData($request)
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): JsonResponse | RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        $previousRoute = Route::getRoutes()->match(request()->create(url()->previousPath()))->getName();

        $requiresRedirect = in_array($previousRoute, ['dashboard', 'collections']);

        if ($request->wantsJson()) {
            return response()->json([
                'action' => $requiresRedirect ? 'galleries' : null,
            ]);
        }

        return $requiresRedirect ? redirect()->route('galleries') : redirect()->back();
    }

    private function getAuthData(Request $request): AuthData
    {
        /** @var User $user */
        $user = $request->user();

        $wallet = $user->wallet;

        /** @var UserData $userData */
        $userData = $user->getData();

        /** @var WalletData  $walletData */
        $walletData = $wallet->getData();

        return new AuthData(
            $userData,
            $walletData,
            $user !== null,
            Signature::walletIsSigned($wallet->id)
        );
    }
}
