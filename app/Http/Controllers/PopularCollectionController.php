<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionData;
use App\Data\Collections\CollectionStatsData;
use App\Data\Network\NetworkWithCollectionsData;
use App\Models\Collection;
use App\Models\Network;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PopularCollectionController extends Controller
{
    public function index(Request $request): Response|JsonResponse|RedirectResponse
    {
        $user = $request->user();

        $selectedChainIds = array_filter(explode(',', $request->get('chain', '')));
        $selectedChainIds = array_filter($selectedChainIds, fn ($id) => is_numeric($id));

        $sortBy = in_array($request->query('sort'), ['oldest', 'received', 'name', 'floor-price', 'value', 'chain']) ? $request->query('sort') : null;
        $defaultSortDirection = $sortBy === null ? 'desc' : 'asc';

        $sortDirection = in_array($request->query('direction'), ['asc', 'desc']) ? $request->query('direction') : $defaultSortDirection;
        $networks = NetworkWithCollectionsData::fromModel($user, false);

        $selectedChainIds = array_filter($selectedChainIds, function ($id) use ($networks) {
            return $networks->firstWhere('chainId', $id)?->collectionsCount > 0;
        });

        $searchQuery = $request->get('query');

        $collections = Collection::query()
            ->when(count($selectedChainIds) > 0, fn ($q) => $q->whereIn('collections.network_id', Network::whereIn('chain_id', $selectedChainIds)->pluck('id')))
            ->when($sortBy === 'name', fn ($q) => $q->orderByName($sortDirection))
            ->when($sortBy === 'chain', fn ($q) => $q->orderByChainId($sortDirection))
            ->with([
                'network',
                'floorPriceToken',
                'nfts' => fn ($q) => $q->limit(4),
            ])
            ->withCount('nfts')
            ->paginate(5);

        return Inertia::render('Collections/PopularCollections/Index', [
            'title' => trans('metatags.popular-collections.title'),
            'allowsGuests' => true,
            'collections' => CollectionData::collection(
                $collections->through(fn ($collection) => CollectionData::fromModel($collection, $user->currency()))
            ),
            'stats' => new CollectionStatsData(
                nfts: 45,
                collections: 5,
                value: 256000,
            ),
            'availableNetworks' => $networks,
            'filters' => $this->getFilters($request),
        ]);
    }

    /**
     * @return object{chain?: string, sort?: string}
     */
    private function getFilters(Request $request): object
    {
        $filter = [
            'chain' => $this->getValidValue($request->get('chain'), ['polygon', 'ethereum']),
            'sort' => $this->getValidValue($request->get('sort'), ['floor-price']),
        ];

        // If value is not defined (or invalid), remove it from the array since
        // the frontend expect `undefined` values (not `null`)

        // Must be cast to an object due to some Inertia front-end stuff...
        return (object) array_filter($filter);
    }

    /**
     * @param  array<string>  $validValues
     */
    private function getValidValue(?string $value, array $validValues): ?string
    {
        return in_array($value, $validValues) ? $value : null;
    }
}
