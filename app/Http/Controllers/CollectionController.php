<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionData;
use App\Data\Collections\CollectionDetailData;
use App\Data\Collections\CollectionNftData;
use App\Data\Collections\CollectionStatsData;
use App\Data\Collections\CollectionTraitFilterData;
use App\Data\Collections\Concerns\QueriesCollectionNfts;
use App\Data\Gallery\GalleryNftData;
use App\Data\Gallery\GalleryNftsData;
use App\Data\Nfts\NftActivitiesData;
use App\Data\Nfts\NftActivityData;
use App\Data\Token\TokenData;
use App\Enums\CurrencyCode;
use App\Enums\NftTransferType;
use App\Enums\TraitDisplayType;
use App\Jobs\SyncCollection;
use App\Models\Collection;
use App\Models\Nft;
use App\Models\User;
use App\Support\Cache\UserCache;
use App\Support\RateLimiterHelpers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class CollectionController extends Controller
{
    use QueriesCollectionNfts;

    public function index(Request $request): Response|JsonResponse|RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return Inertia::render('Collections/Index', [
                'title' => trans('metatags.collections.title'),
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

        if ($showHidden && $hiddenCollections->isEmpty()) {
            return redirect()->route('collections', $request->except('showHidden'));
        }

        $cache = new UserCache($user);

        $sortBy = in_array($request->query('sort'), ['oldest', 'received', 'name', 'floor-price', 'value', 'chain']) ? $request->query('sort') : null;
        $defaultSortDirection = $sortBy === null ? 'desc' : 'asc';

        $sortDirection = in_array($request->query('direction'), ['asc', 'desc']) ? $request->query('direction') : $defaultSortDirection;

        if ($request->wantsJson()) {
            $searchQuery = $request->get('query');

            /** @var LengthAwarePaginator<Collection> $collections */
            $collections = $user->collections()
                ->forCollectionData($user)
                ->when($showHidden, fn ($q) => $q->whereIn('collections.id', $user->hiddenCollections->modelKeys()))
                ->when(! $showHidden, fn ($q) => $q->whereNotIn('collections.id', $user->hiddenCollections->modelKeys()))
                ->when($sortBy === 'name', fn ($q) => $q->orderBy('name', $sortDirection))
                ->when($sortBy === 'floor-price', fn ($q) => $q->orderByFloorPrice($sortDirection, $user->currency()))
                ->when($sortBy === 'value' || $sortBy === null, fn ($q) => $q->orderByValue($user->wallet, $sortDirection, $user->currency()))
                ->when($sortBy === 'chain', fn ($q) => $q->orderByChainId($sortDirection))
                ->when($sortBy === 'oldest', fn ($q) => $q->orderByMintDate('asc'))
                ->when($sortBy === 'received', fn ($q) => $q->orderByReceivedDate($user->wallet, 'desc'))
                ->search($user, $searchQuery)
                ->paginate(25);

            $reportByCollectionAvailableIn = $collections->mapWithKeys(function ($collection) use ($request) {
                return [$collection->address => RateLimiterHelpers::collectionReportAvailableInHumanReadable($request, $collection)];
            });

            $alreadyReportedByCollection = $collections->mapWithKeys(function ($collection) use ($user) {
                return [$collection->address => $collection->wasReportedByUserRecently($user)];
            });

            $nfts = Nft::forCollections(
                collections: $collections,
                limitPerCollection: 4,
                user: $user
            )->get();

            return new JsonResponse([
                'collections' => CollectionData::collection($collections),
                'nfts' => CollectionNftData::collection($nfts),
                'reportByCollectionAvailableIn' => $reportByCollectionAvailableIn,
                'alreadyReportedByCollection' => $alreadyReportedByCollection,
                'hiddenCollectionAddresses' => $hiddenCollections,
            ]);
        }

        return Inertia::render('Collections/Index', [
            'title' => trans('metatags.collections.title'),
            'stats' => new CollectionStatsData(
                nfts: $showHidden ? $cache->hiddenNftsCount() : $cache->shownNftsCount(),
                collections: $showHidden ? $cache->hiddenCollectionsCount() : $cache->shownCollectionsCount(),
                value: $user->collectionsValue($user->currency(), readFromDatabase: false, onlyHidden: $showHidden),
            ),
            'sortBy' => $sortBy,
            'sortDirection' => $sortDirection,
            'showHidden' => $showHidden,
            'view' => $request->get('view') === 'grid' ? 'grid' : 'list',
        ]);
    }

    public function view(Request $request, Collection $collection): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        $sortByMintDate = $request->query('sort') === 'minted';

        $reportAvailableIn = RateLimiterHelpers::collectionReportAvailableInHumanReadable($request, $collection);

        if (! $collection->recentlyViewed()) {
            SyncCollection::dispatch($collection);
        }

        $collection->touchQuietly('last_viewed_at');

        $ownedNftsCount = $user
            ? $collection
                ->nfts()
                ->select('nfts.*')
                ->filter([
                    'owned' => true,
                    'traits' => $this->normalizeTraits($request->get('traits', [])),
                ], $user)
                ->count()
            : 0;

        $filters = $this->parseFilters($request, $ownedNftsCount);

        $nfts = $collection
            ->nfts()
            ->select('nfts.*')
            ->filter($filters, $user)
            ->search($request->get('query'))
            ->when($user, fn ($q) => $q->orderByOwnership($user))
            ->when($sortByMintDate, fn ($q) => $q->orderByMintDate('desc'))
            ->when(! $sortByMintDate, fn ($q) => $q->orderBy('token_number', 'asc'))
            ->paginate(12)
            ->appends($request->all());

        // Allow any number but not more than 100
        $pageLimit = min($request->has('pageLimit') ? (int) $request->get('pageLimit') : 10, 100);

        $tab = $request->get('tab') === 'activity' ? 'activity' : 'collection';

        $activities = $collection->activities()->latest('timestamp')->where('type', '!=', NftTransferType::Transfer)->paginate($pageLimit)->appends([
            'tab' => 'activity',
            'pageLimit' => $pageLimit,
        ]);

        /** @var \Spatie\LaravelData\PaginatedDataCollection<int, \App\Data\Nfts\NftActivityData> */
        $paginated = NftActivityData::collection($activities);

        /** @var \Spatie\LaravelData\PaginatedDataCollection<int, \App\Data\Gallery\GalleryNftData> */
        $paginatedNfts = GalleryNftData::collection($nfts);

        $nativeToken = $collection->network->tokens()->nativeToken()->defaultToken()->first();

        $currency = $user ? $user->currency() : CurrencyCode::USD;

        return Inertia::render('Collections/View', [
            'activities' => new NftActivitiesData($paginated),
            'collection' => CollectionDetailData::fromModel($collection, $currency, $user),
            'isHidden' => $user && $user->hiddenCollections()->where('id', $collection->id)->exists(),
            'previousUrl' => url()->previous() === url()->current()
                ? null
                : url()->previous(),
            'nfts' => new GalleryNftsData($paginatedNfts),
            'collectionTraits' => CollectionTraitFilterData::fromCollection($collection),
            'alreadyReported' => $user && $collection->wasReportedByUserRecently($user),
            'reportAvailableIn' => $reportAvailableIn,
            'appliedFilters' => $this->appliedParameters($request, $pageLimit, $tab, $filters),
            'sortByMintDate' => $sortByMintDate,
            'nativeToken' => TokenData::fromModel($nativeToken),
            'allowsGuests' => true,
        ]);
    }

    /**
     * @return array{
     *   owned: bool,
     *   traits: array<string, array<string, string[]>> | null,
     * }
     */
    private function parseFilters(Request $request, int $ownedNftsCount): array
    {
        $traits = $request->get('traits', []);

        $owned = $request->get('owned') === null ? true : $request->boolean('owned');

        if ($ownedNftsCount === 0 && $request->get('owned') === null) {
            $owned = false;
        }

        return [
            'owned' => $owned,
            'traits' => $this->normalizeTraits($traits),
        ];
    }

    /**
     * @return array<string, array<string, string[]>> | null
     */
    private function normalizeTraits(mixed $traits): ?array
    {
        if (! is_array($traits) || count($traits) === 0) {
            return null;
        }

        $groups = array_filter(array_keys($traits), fn ($groupName) => is_string($groupName));

        $normalized = collect($groups)->filter(function ($groupName) use ($traits) {
            return is_array($traits[$groupName]);
        })->mapWithKeys(function ($groupName) use ($traits) {
            /** @var array<string, array{ value: string, displayType: string }[]> $traits */
            $values = collect($traits[$groupName])
                ->filter(fn ($tuple) => is_string($tuple['value']) && ! is_null(TraitDisplayType::tryFrom($tuple['displayType'])))
                ->groupBy('displayType')
                ->flatMap(fn ($x, $displayType) => [$displayType => $x->pluck('value')->toArray()]);

            return [$groupName => $values];
        })->toArray();

        if (count($normalized) === 0) {
            return null;
        }

        return $normalized;
    }

    /**
     * @param array{
     *   owned: bool,
     *   traits: array<string, array<string, string[]>> | null,
     * } $filters
     * @return array{owned: bool, traits: array<string, array<string, string[]>> | null}
     */
    private function appliedParameters(Request $request, int $pageLimit, string $tab, mixed $filters): array
    {
        // transform sanitized traits back into the same format as frontend gave us
        $traits = collect($filters['traits'] ?? [])
            ->map(
                fn ($traits) => collect($traits)
                    ->flatMap(function ($valuePairs, string $displayType) {
                        /** @var \Illuminate\Support\Collection<string, array<string, string[]>> $valuePairs */
                        $valuePairs = collect($valuePairs);

                        return $valuePairs
                            ->flatMap(function ($values) use ($displayType) {
                                /** @var \Illuminate\Support\Collection<int, string> $values */
                                $values = collect($values);

                                return $values
                                    ->mapWithKeys(fn (string $value, int $index) => [$index => ['displayType' => $displayType, 'value' => $value]]);
                            });
                    })
            );

        return [
            'owned' => $filters['owned'],
            'traits' => $traits->isEmpty() ? null : $traits->toArray(),
            'tab' => $tab,
            'pageLimit' => $pageLimit,
        ];
    }
}
