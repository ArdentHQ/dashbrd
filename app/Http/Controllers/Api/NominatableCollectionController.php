<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Data\Collections\VotableCollectionData;
use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NominatableCollectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'nullable|string',
        ]);

        /** @var string|null */
        $query = $request->query('query');

        $collections = Collection::search($request->user(), $query)
                                ->limit(15)
                                ->withCount('nfts')
                                ->orderBy('name', 'asc')
                                ->get();

        return response()->json([
            'collections' => $collections->map(
                fn ($collection) => VotableCollectionData::fromModel($collection, $request->user()->currency(), showVotes: false)
            ),
        ]);
    }
}
