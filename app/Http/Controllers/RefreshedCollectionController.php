<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\FetchCollectionFloorPrice;
use App\Jobs\FetchCollectionOwners;
use App\Jobs\FetchCollectionTraits;
use App\Jobs\FetchCollectionVolume;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;

class RefreshedCollectionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $wallet = $request->wallet();

        abort_unless($wallet->canRefreshCollections(), 403);

        $collections = $wallet->nfts->load('collection.network')->map->collection->flatten()->unique();

        $wallet->update([
            'is_refreshing_collections' => true,
        ]);

        Bus::batch($collections->flatMap(fn ($collection) => [
            new FetchCollectionFloorPrice($collection->network->chain_id, $collection->address),
            new FetchCollectionTraits($collection),
            new FetchCollectionOwners($collection),
            new FetchCollectionVolume($collection),
        ]))->finally(function () use ($wallet) {
            $wallet->update([
                'is_refreshing_collections' => false,
                'refreshed_collections_at' => now(),
            ]);
        })->dispatch();

        return back()->toast('Loading...', type: 'pending', expanded: true);
    }
}
