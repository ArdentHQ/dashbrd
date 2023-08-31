<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboarded
{
    /**
     * @param  \Closure(Request):Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $wallet = $request->wallet();

        if (! $wallet || $wallet->onboarded()) {
            return $next($request);
        }

        if ($request->isMethod('GET')) {
            return redirect()->route('onboarding')->with('onboarding:redirect', $request->url());
        }

        // This only triggers for non-GET methods (POST, DELETE, PUT, ...) for non-onboarded users...
        abort(403);
    }
}
