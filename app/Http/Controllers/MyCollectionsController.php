<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionData;
use App\Data\Collections\CollectionStatsData;
use App\Data\Network\NetworkWithCollectionsData;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Cache\UserCache;
use App\Support\RateLimiterHelpers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class MyCollectionsController extends Controller
{
    public function index(Request $request): Response|JsonResponse|RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return Inertia::render('Collections/MyCollections/Index', [
                'title' => trans('metatags.my-collections.title'),
                'stats' => new CollectionStatsData(
                    nfts: 0,
                    collections: 0,
                    value: 0,
                ),
                'sortBy' => null,
                'sortDirection' => 'desc',
                'showHidden' => false,
                'view' => 'list',
            ]);
        }

        $hiddenCollections = $user->hiddenCollections->pluck('address');
        $showHidden = $request->get('showHidden') === 'true';

        $selectedChainIds = array_filter(explode(',', $request->get('chain', '')));
        $selectedChainIds = array_filter($selectedChainIds, fn ($id) => is_numeric($id));

        if ($showHidden && $hiddenCollections->isEmpty()) {
            return redirect()->route('collections', $request->except('showHidden'));
        }

        $cache = new UserCache($user);

        $sortBy = in_array($request->query('sort'), ['oldest', 'received', 'name', 'floor-price', 'value', 'chain']) ? $request->query('sort') : null;
        $defaultSortDirection = $sortBy === null ? 'desc' : 'asc';

        $sortDirection = in_array($request->query('direction'), ['asc', 'desc']) ? $request->query('direction') : $defaultSortDirection;
        $networks = NetworkWithCollectionsData::fromModel($user, $showHidden);

        $selectedChainIds = array_filter($selectedChainIds, function ($id) use ($networks) {
            return $networks->firstWhere('chainId', $id)?->collectionsCount > 0;
        });

        if ($request->wantsJson()) {
            $searchQuery = $request->get('query');

            /** @var LengthAwarePaginator<Collection> $collections */
            $collections = $user->collections()
                ->when($showHidden, fn ($q) => $q->whereIn('collections.id', $user->hiddenCollections->modelKeys()))
                ->when(! $showHidden, fn ($q) => $q->whereNotIn('collections.id', $user->hiddenCollections->modelKeys()))
                ->when(count($selectedChainIds) > 0, fn ($q) => $q->whereIn('collections.network_id', Network::whereIn('chain_id', $selectedChainIds)->pluck('id')))
                ->when($sortBy === 'name', fn ($q) => $q->orderByName($sortDirection))
                ->when($sortBy === 'floor-price', fn ($q) => $q->orderByFloorPrice($sortDirection, $user->currency()))
                ->when($sortBy === 'value', fn ($q) => $q->orderByValue($user->wallet, $sortDirection, $user->currency()))
                ->when($sortBy === 'chain', fn ($q) => $q->orderByChainId($sortDirection))
                ->when($sortBy === 'oldest', fn ($q) => $q->orderByMintDate('asc'))
                ->when($sortBy === 'received' || $sortBy === null, fn ($q) => $q->orderByReceivedDate($user->wallet, 'desc'))
                ->search($user, $searchQuery)
                ->with([
                    'reports',
                    'network',
                    'floorPriceToken',
                    'nfts' => fn ($q) => $q->where('wallet_id', $user->wallet_id)->limit(4),
                ])
                ->withCount(['nfts' => fn ($q) => $q->where('wallet_id', $user->wallet_id)])
                ->paginate(25);

            $reportByCollectionAvailableIn = $collections->mapWithKeys(function ($collection) use ($request) {
                return [$collection->address => RateLimiterHelpers::collectionReportAvailableInHumanReadable($request, $collection)];
            });

            $alreadyReportedByCollection = $collections->mapWithKeys(function ($collection) use ($user) {
                return [$collection->address => $collection->wasReportedByUserRecently($user, useRelationship: true)];
            });

            return new JsonResponse([
                'collections' => CollectionData::collection(
                    $collections->through(fn ($collection) => CollectionData::fromModel($collection, $user->currency()))
                ),
                'reportByCollectionAvailableIn' => $reportByCollectionAvailableIn,
                'alreadyReportedByCollection' => $alreadyReportedByCollection,
                'hiddenCollectionAddresses' => $hiddenCollections,
                'availableNetworks' => $networks,
                'selectedChainIds' => $selectedChainIds,
                'stats' => new CollectionStatsData(
                    nfts: $showHidden ? $cache->hiddenNftsCount() : $cache->shownNftsCount(),
                    collections: $showHidden ? $cache->hiddenCollectionsCount() : $cache->shownCollectionsCount(),
                    value: $user->collectionsValue($user->currency(), readFromDatabase: false, onlyHidden: $showHidden),
                ),
            ]);
        }

        return Inertia::render('Collections/MyCollections/Index', [
            'title' => trans('metatags.my-collections.title'),
            'initialStats' => new CollectionStatsData(
                nfts: $showHidden ? $cache->hiddenNftsCount() : $cache->shownNftsCount(),
                collections: $showHidden ? $cache->hiddenCollectionsCount() : $cache->shownCollectionsCount(),
                value: $user->collectionsValue($user->currency(), readFromDatabase: false, onlyHidden: $showHidden),
            ),
            'sortBy' => $sortBy,
            'sortDirection' => $sortDirection,
            'showHidden' => $showHidden,
            'selectedChainIds' => $selectedChainIds,
            'view' => $request->get('view') === 'grid' ? 'grid' : 'list',
            'availableNetworks' => $networks,
        ]);
    }
}
