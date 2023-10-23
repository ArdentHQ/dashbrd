<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\RefreshWalletCollections;
use App\Support\Queues;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RefreshedCollectionController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'indexing' => $request->wallet()->is_refreshing_collections,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->wallet()->canRefreshCollections(), 403);

        RefreshWalletCollections::dispatch($request->wallet())->onQueue(Queues::WALLETS);

        return back()->toast(
            trans('pages.collections.refresh.toast'),
            type: 'pending',
            expanded: true,
            loading: true
        );
    }
}
