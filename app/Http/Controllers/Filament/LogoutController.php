<?php

declare(strict_types=1);

namespace App\Http\Controllers\Filament;

use Filament\Facades\Filament;
use Filament\Http\Controllers\Auth\LogoutController as FilamentLogoutController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LogoutController extends FilamentLogoutController
{
    public function logout(Request $request): RedirectResponse
    {
        Filament::auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('galleries');
    }
}
