<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\Facades\Signature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthStatusController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        $wallet = $user?->wallet;

        return response()->json([
            'authenticated' => $user !== null,
            'signed' => $wallet !== null ? Signature::walletIsSigned($wallet->id) : false,
        ]);
    }
}
