<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionData;
use App\Http\Controllers\Traits\HasCollectionFilters;
use App\Http\Requests\FilterableCollectionRequest;
use App\Repositories\CollectionMetricsRepository;
use Inertia\Inertia;
use Inertia\Response;

class PopularCollectionController extends Controller
{
    use HasCollectionFilters;

    /**
     * Render the table that contains all of popular collections, but paginated.
     */
    public function index(FilterableCollectionRequest $request, CollectionMetricsRepository $metrics): Response
    {
        $currency = $request->currency();

        return Inertia::render('Collections/CollectionsCatalog/Index', [
            'title' => trans('metatags.popular-collections.title'),
            'allowsGuests' => true,
            'collections' => CollectionData::collection(
                $collections->through(fn ($collection) => CollectionData::fromModel($collection, $currency, volumePeriod: $period))
            ),
            'stats' => $metrics->total($request->currency()),
            'filters' => $this->getFilters($request),
        ]);
    }
}
