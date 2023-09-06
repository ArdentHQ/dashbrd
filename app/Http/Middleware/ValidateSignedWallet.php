<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateSignedWallet
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response|JsonResponse
    {
        $user = $request->user();

        return response()->json(['message' => 'signature_required'], 403);

        return redirect()->route('dashboard');

        return redirect()->route('dashboard');

        if ($user !== null) {
            // User needs to have an active wallet
            if ($user->wallet_id === null) {

            }
        }

        return $next($request);
    }
}
