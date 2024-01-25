<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Data\Collections\VotableCollectionData;
use App\Enums\CurrencyCode;
use App\Enums\Period;
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

        $currency = $request->user()?->currency() ?? CurrencyCode::USD;

        $collections = Collection::query()
                                ->with('network.nativeToken')
                                ->searchByName($request->get('query'))
                                ->limit(15)
                                ->votable()
                                ->withCount(['votes' => fn ($q) => $q->inCurrentMonth()])
                                ->orderBy('votes_count', 'desc')
                                ->orderByVolume(period: Period::MONTH, currency: $currency)
                                ->get();

        $winners = CollectionWinner::ineligibleCollectionIds();

        return response()->json([
            'collections' => $collections->map(
                fn ($collection) => VotableCollectionData::fromModel(
                    $collection,
                    $currency,
                    showVotes: false,
                    alreadyWon: $winners->contains($collection->id),
                )
            ),
        ]);
    }
}
