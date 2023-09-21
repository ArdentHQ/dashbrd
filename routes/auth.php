<?php

declare(strict_types=1);

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

Route::post('sign-message', [AuthenticatedSessionController::class, 'signMessage'])->name('sign-message');

Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login');

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::post('sign', [AuthenticatedSessionController::class, 'sign'])
        ->name('sign');
});
