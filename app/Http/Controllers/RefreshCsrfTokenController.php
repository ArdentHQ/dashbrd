<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RefreshCsrfTokenController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->session()->regenerateToken();

        return response()->json();
    }
}
