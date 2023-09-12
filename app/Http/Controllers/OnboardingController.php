<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function show(Request $request): JsonResponse|RedirectResponse|Response
    {
        if ($request->wantsJson()) {
            return response()->json([
                'onboarded' => $request->wallet()->onboarded(),
            ]);
        }


        $redirectRoute = $request->query('redirectTo', 'galleries');
        $redirectUrl = Route::has($redirectRoute) && is_string($redirectRoute) ? $redirectRoute : 'galleries';

        if ($request->wallet()->onboarded() && !Route::has($request->query('redirectTo'))) {
            return redirect()->route('galleries');
        }

        return Inertia::render('Onboarding', [
            'redirectTo' => $request->session()->get('onboarding:redirect', default: route($redirectUrl)),
        ]);
    }
}
