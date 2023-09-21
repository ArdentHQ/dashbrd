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

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        /** @var User $user */
        $user = $request->user();

        $wallet = $user->wallet;

        /** @var UserData $userData */
        $userData = $user->getData();

        /** @var WalletData $walletData */
        $walletData = $wallet->getData();

        return response()->json([
            'auth' => new AuthData(
                $userData,
                $walletData,
                $user !== null,
                $wallet !== null && Signature::walletIsSigned($wallet->id)
            ),
        ]);
    }

    /**
     * Generate a new signature for verifying the wallet address
     */
    public function signMessage(SignMessageRequest $request): JsonResponse
    {
        return response()->json(['message' => $request->getMessage()]);
    }

    public function sign(SignRequest $request): RedirectResponse
    {
        $request->sign();

        return redirect()->back();
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect()->route('galleries');
    }
}
