<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\Features;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Pennant\Feature;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if ($this->portfolioIsDisabled($request)) {
            return $this->redirectToEnabledSection();
        }

        return Inertia::render('Dashboard');
    }

    private function redirectToEnabledSection(): RedirectResponse
    {
        if (Feature::active(Features::Galleries->value)) {
            return redirect()->route('galleries');
        } elseif (Feature::active(Features::Collections->value)) {
            return redirect()->route('collections');
        }

        return redirect()->route('settings.general');
    }

    private function portfolioIsDisabled(Request $request): bool
    {
        return $request->user() !== null && ! Feature::active(Features::Portfolio->value);
    }
}
