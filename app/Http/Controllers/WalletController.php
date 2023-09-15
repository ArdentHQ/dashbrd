<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $wallet = $user?->wallet;
        $walletData = $wallet?->getData();
        $userData = $user?->getData();

        return new JsonResponse([
            'wallet' => $walletData,
            'user' => $userData,
        ]);
    }
}
