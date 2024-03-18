<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Data\Collections\VotableCollectionData;
use App\Http\Controllers\Controller;
use App\Http\Requests\FilterableCollectionRequest;
use App\Models\CollectionWinner;
use App\Repositories\CollectionRepository;
use Illuminate\Http\JsonResponse;

class NominatableCollectionController extends Controller
{
    public function index(FilterableCollectionRequest $request, CollectionRepository $collections): JsonResponse
    {
        $request->validate([
            'query' => 'nullable|string',
        ]);

        /** @var string|null */
        $query = $request->query('query');

        $collections = $collections->nominatable(
            searchQuery: $query,
            currency: $request->currency()
        );

        $winners = CollectionWinner::ineligibleCollectionIds();

        return response()->json([
            'collections' => $collections->map(
                fn ($collection) => VotableCollectionData::fromModel(
                    collection: $collection,
                    currency: $request->currency(),
                    showVotes: false,
                    alreadyWon: $winners->contains($collection->id),
                )
            ),
        ]);
    }
}
