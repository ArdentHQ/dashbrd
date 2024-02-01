<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Data\Collections\CollectionData;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HasCollectionFilters;
use App\Http\Requests\FilterableCollectionRequest;
use App\Repositories\CollectionRepository;
use Illuminate\Http\JsonResponse;

class AllPopularCollectionController extends Controller
{
    use HasCollectionFilters;

    /**
     * Get all of the popular collections.
     */
    public function index(FilterableCollectionRequest $request, CollectionRepository $collections): JsonResponse
    {
        $currency = $request->currency();
        $period = $request->period();

        /** @var string|null */
        $sortBy = in_array($request->query('sort'), $this->allowedSortByValues) ? $request->query('sort') : null;

        $collections = $collections->allPopular(
            searchQuery: $request->get('query'),
            period: $period,
            chain: $request->chain(),
            currency: $currency,
            sortBy: $sortBy,
            order: $request->sortDirection(default: $sortBy === null ? 'desc' : 'asc'),
            perPage: $request->perPage(),
        );

        return response()->json([
            'collections' => CollectionData::collection($collections->through(
                fn ($collection) => CollectionData::fromModel($collection, $currency, volumePeriod: $period)
            )),
        ]);
    }
}
