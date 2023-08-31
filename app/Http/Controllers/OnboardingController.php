<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        if ($request->wallet()->onboarded()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Onboarding', [
            'redirectTo' => $request->session()->get('onboarding:redirect', default: route('dashboard')),
        ]);
    }
}
