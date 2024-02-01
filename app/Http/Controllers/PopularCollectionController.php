<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionData;
use App\Enums\Chain;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Http\Controllers\Traits\HasCollectionFilters;
use App\Http\Requests\FilterableCollectionRequest;
use App\Models\Collection;
use App\Repositories\CollectionMetricRepository;
use Inertia\Inertia;
use Inertia\Response;

class PopularCollectionController extends Controller
{
    use HasCollectionFilters;

    /**
     * Render the table that contains all of popular collections, but paginated.
     */
    public function index(FilterableCollectionRequest $request, CollectionMetricRepository $metrics): Response
    {
        $user = $request->user();

        $chainId = match ($request->query('chain')) {
            'polygon' => Chain::Polygon->value,
            'ethereum' => Chain::ETH->value,
            default => null,
        };

        $currency = $user ? $user->currency() : CurrencyCode::USD;

        $perPage = min($request->has('perPage') ? (int) $request->get('perPage') : 50, 100);

        $sortBy = in_array($request->query('sort'), $this->allowedSortByValues) ? $request->query('sort') : null;

        $defaultSortDirection = $sortBy === null ? 'desc' : 'asc';

        $sortDirection = in_array($request->query('direction'), ['asc', 'desc']) ? $request->query('direction') : $defaultSortDirection;

        $period = match ($request->query('period')) {
            '7d' => Period::WEEK,
            '30d' => Period::MONTH,
            default => Period::DAY,
        };

        $collections = Collection::query()
                            ->searchByName($request->get('query'))
                            ->when($sortBy === null, fn ($q) => $q->orderByVolume($period, currency: $chainId === null ? $currency : null))
                            ->when($sortBy === 'name', fn ($q) => $q->orderByName($sortDirection))
                            ->when($sortBy === 'value', fn ($q) => $q->orderByValue(null, $sortDirection, $currency))
                            ->when($sortBy === 'floor-price', fn ($q) => $q->orderByFloorPrice($sortDirection, $currency))
                            ->when($sortBy === 'chain', fn ($q) => $q->orderByChainId($sortDirection))
                            ->filterByChainId($chainId)
                            ->orderByFloorPrice('desc', $currency)
                            ->with([
                                'network',
                                'network.nativeToken',
                                'floorPriceToken',
                                'nfts' => fn ($q) => $q->limit(4),
                            ])
                            ->withCount('nfts')
                            ->paginate($perPage)
                            ->withQueryString();

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
