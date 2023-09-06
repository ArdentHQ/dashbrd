<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\Facades\Signature;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateSignedWallet
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(Request):Response  $next
     */
    public function handle(Request $request, Closure $next): Response|JsonResponse
    {
        $wallet = $request->wallet();

        if ($wallet === null || ! Signature::walletIsSigned($wallet->id)) {
            return response()->json(['message' => 'signature_required'], 403);
        }

        return $next($request);
    }
}
