<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Data\Collections\PopularCollectionData;
use App\Http\Controllers\Controller;
use App\Http\Requests\FilterableCollectionRequest;
use App\Models\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\Paginator;

class PopularCollectionController extends Controller
{
    /**
     * Get the top 12 collections.
     */
    public function index(FilterableCollectionRequest $request): JsonResponse
    {
        $chain = $request->chain();
        $currency = $request->currency();
        $period = $request->period();

        /** @var Paginator<PopularCollectionData> $collections */
        $collections = Collection::query()
                                ->when($request->query('sort') !== 'floor-price', fn ($q) => $q->orderByVolume($period, currency: $chain === null ? $currency : null))
                                ->filterByChainId($chain?->value)
                                ->orderByFloorPrice('desc', $currency)
                                ->with([
                                    'network',
                                    'floorPriceToken',
                                    'floorPriceHistory' => fn ($q) => $q->where('retrieved_at', '>=', now()->subDays(1)->startOfDay()),
                                ])
                                ->simplePaginate(12);

        return response()->json([
            'collections' => $collections->through(
                fn ($collection) => PopularCollectionData::fromModel($collection, $currency, $period)
            ),
        ]);
    }
}
