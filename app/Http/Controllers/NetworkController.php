<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\NetworkData;
use App\Models\Network;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NetworkController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $network = Network::where('chain_id', $request->chainId)->first();

        return response()->json(
            NetworkData::fromModel($network),
        );
    }
}
