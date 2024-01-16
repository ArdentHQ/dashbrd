<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Data\Collections\VotableCollectionData;
use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\CollectionWinner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NominatableCollectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'nullable|string',
        ]);

        $currency = $request->user()->currency();

        $collections = Collection::query()
                                ->searchByName($request->get('query'))
                                ->limit(15)
                                ->votable($currency, orderByVotes: false)
                                ->orderBy('name', 'asc')
                                ->get();

        $winners = CollectionWinner::ineligibleCollectionIds();

        return response()->json([
            'collections' => $collections->map(
                fn ($collection) => VotableCollectionData::fromModel($collection, $currency, showVotes: false, alreadyWon: $winners->contains($collection->id))
            ),
        ]);
    }
}
