<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\FetchNativeBalances;
use App\Jobs\FetchTokens;
use App\Models\Network;
use App\Support\Queues;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionSuccessController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $wallet = $request->wallet();

        $network = Network::where('chain_id', $request->chainId)->firstOrFail();

        FetchTokens::dispatch($wallet, $network)->onQueue(Queues::PRIORITY);

        FetchNativeBalances::dispatch($wallet, $network)->onQueue(Queues::PRIORITY);

        return response()->json(['success' => true]);
    }
}
