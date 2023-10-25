<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\RefreshWalletCollections;
use App\Support\Queues;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RefreshedCollectionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        if ($request->wallet()->canRefreshCollections()) {
            RefreshWalletCollections::dispatch($request->wallet())->onQueue(Queues::WALLETS);
        }

        return back()->toast(
            trans('pages.collections.refresh.toast'),
            type: 'pending',
            expanded: true,
        );
    }
}
