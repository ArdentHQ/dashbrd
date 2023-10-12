<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Articles\ArticleData;
use App\Data\Articles\ArticlesData;
use App\Data\Collections\CollectionData;
use App\Data\Collections\CollectionDetailData;
use App\Data\Collections\CollectionNftData;
use App\Data\Collections\CollectionStatsData;
use App\Data\Collections\CollectionTraitFilterData;
use App\Data\Gallery\GalleryNftData;
use App\Data\Gallery\GalleryNftsData;
use App\Data\Network\NetworkWithCollectionsData;
use App\Data\Nfts\NftActivitiesData;
use App\Data\Nfts\NftActivityData;
use App\Data\Token\TokenData;
use App\Enums\CurrencyCode;
use App\Enums\NftTransferType;
use App\Enums\TraitDisplayType;
use App\Jobs\FetchCollectionBanner;
use App\Jobs\SyncCollection;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;
use App\Models\User;
use App\Support\Cache\UserCache;
use App\Support\RateLimiterHelpers;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\LaravelData\PaginatedDataCollection;

class CollectionController extends Controller
{
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
                ->forCollectionData($user)
                ->when($showHidden, fn ($q) => $q->whereIn('collections.id', $user->hiddenCollections->modelKeys()))
                ->when(! $showHidden, fn ($q) => $q->whereNotIn('collections.id', $user->hiddenCollections->modelKeys()))
                ->when(count($selectedChainIds) > 0, fn ($q) => $q->whereIn('collections.network_id', Network::whereIn('chain_id', $selectedChainIds)->pluck('id')))
                ->when($sortBy === 'name', fn ($q) => $q->orderBy('name', $sortDirection))
                ->when($sortBy === 'floor-price', fn ($q) => $q->orderByFloorPrice($sortDirection, $user->currency()))
                ->when($sortBy === 'value' || $sortBy === null, fn ($q) => $q->orderByValue($user->wallet, $sortDirection, $user->currency()))
                ->when($sortBy === 'chain', fn ($q) => $q->orderByChainId($sortDirection))
                ->when($sortBy === 'oldest', fn ($q) => $q->orderByMintDate('asc'))
                ->when($sortBy === 'received', fn ($q) => $q->orderByReceivedDate($user->wallet, 'desc'))
                ->search($user, $searchQuery)
                ->with('reports')
                ->paginate(25);

            $reportByCollectionAvailableIn = $collections->mapWithKeys(function ($collection) use ($request) {
                return [$collection->address => RateLimiterHelpers::collectionReportAvailableInHumanReadable($request, $collection)];
            });

            $alreadyReportedByCollection = $collections->mapWithKeys(function ($collection) use ($user) {
                return [$collection->address => $collection->wasReportedByUserRecently($user, useRelationship: true)];
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
                'availableNetworks' => $networks,
                'selectedChainIds' => $selectedChainIds,
                'stats' => new CollectionStatsData(
                    nfts: $showHidden ? $cache->hiddenNftsCount() : $cache->shownNftsCount(),
                    collections: $showHidden ? $cache->hiddenCollectionsCount() : $cache->shownCollectionsCount(),
                    value: $user->collectionsValue($user->currency(), readFromDatabase: false, onlyHidden: $showHidden),
                ),
            ]);
        }

        return Inertia::render('Collections/Index', [
            'title' => trans('metatags.collections.title'),
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

    public function show(Request $request, Collection $collection): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        $sortByMintDate = $request->query('sort') === 'minted';

        $tab = in_array($request->get('tab'), ['collection', 'articles', 'activity']) ? $request->get('tab') : 'collection';

        $pageLimit = $this->getPageLimit($request, $tab);

        $filters = $this->parseFilters($request, $tab, $collection, $user);

        return Inertia::render('Collections/View', [
            'collection' => fn () => $this->loadCollection($collection, $user),
            'isHidden' => fn () => $user && $user->hiddenCollections()->where('id', $collection->id)->exists(),
            'previousUrl' => fn () => url()->previous() === url()->current()
                ? null
                : url()->previous(),
            'alreadyReported' => fn () => $user && $collection->wasReportedByUserRecently($user),
            'reportAvailableIn' => fn () => RateLimiterHelpers::collectionReportAvailableInHumanReadable($request, $collection),
            'appliedFilters' => $this->appliedParameters(
                pageLimit: $pageLimit,
                tab: $tab,
                filters: $filters,
            ),
            'sortByMintDate' => $sortByMintDate,
            'nativeToken' => fn () => $this->getNativeToken($collection),
            'allowsGuests' => true,
            'title' => fn () => trans('metatags.collections.view.title', ['name' => $collection->name]),
            'showReportModal' => fn () => $request->boolean('report'),

            'collectionTraits' => $tab !== 'collection'
                ? Inertia::lazy(fn () => CollectionTraitFilterData::fromCollection($collection))
                : CollectionTraitFilterData::fromCollection($collection),

            'nfts' => $tab !== 'collection'
                ? Inertia::lazy(fn () => $this->getNfts(
                    request: $request,
                    collection: $collection,
                    user: $user,
                    sortByMintDate: $sortByMintDate,
                    pageLimit: $pageLimit,
                    nftFilters: $filters,
                )) : $this->getNfts(
                    request: $request,
                    collection: $collection,
                    user: $user,
                    sortByMintDate: $sortByMintDate,
                    pageLimit: $pageLimit,
                    nftFilters: $filters,
                ),

            'activities' => $tab !== 'activity'
                ? Inertia::lazy(fn () => $this->getActivites($collection, $request, $pageLimit))
                : $this->getActivites($collection, $request, $pageLimit),

            'articles' => $tab !== 'articles'
                ? Inertia::lazy(fn () => $this->getArticles($collection, $request))
                : $this->getArticles($collection, $request),

        ])->withViewData([
            'title' => trans('metatags.collections.view.title', ['name' => $collection->name]),
            'description' => trans('metatags.collections.view.description', ['name' => $collection->name]),
            'image' => trans('metatags.collections.view.image'),
        ]);
    }

    private function getPageLimit(Request $request, string $tab): int
    {
        if ($tab === 'activity') {
            // Allow any number but not more than 100, default to 10
            return min($request->has('pageLimit') ? (int) $request->get('pageLimit') : 10, 100);
        }

        // Allow any number but not more than 98, default to 24
        return min($request->has('pageLimit') ? (int) $request->get('pageLimit') : 24, 96);
    }

    private function getNativeToken(Collection $collection): TokenData
    {
        $nativeToken = $collection->network->tokens()->nativeToken()->defaultToken()->first();

        return TokenData::fromModel($nativeToken);
    }

    private function loadCollection(Collection $collection, ?User $user): CollectionDetailData
    {
        if (! $collection->recentlyViewed()) {
            $bannerUpdatedAt = $collection->bannerUpdatedAt();
            $formattedBannerUpdatedAt = $bannerUpdatedAt ? Carbon::parse($bannerUpdatedAt) : null;

            if ($collection->banner() === null || $formattedBannerUpdatedAt === null || ($formattedBannerUpdatedAt !== null && $formattedBannerUpdatedAt->diffInDays(now()) > 7)) {
                FetchCollectionBanner::dispatch($collection);
            }

            SyncCollection::dispatch($collection);
        }

        $collection->touchQuietly('last_viewed_at');

        $currency = $user ? $user->currency() : CurrencyCode::USD;

        return CollectionDetailData::fromModel($collection, $currency, $user);
    }

    private function getNfts(Request $request, Collection $collection, ?User $user, bool $sortByMintDate, int $pageLimit, array $nftFilters): GalleryNftsData
    {
        $ownedNftIds = $user
            ? $collection->nfts()->ownedBy($user)->pluck('id')
            : collect([]);

        $nfts = $collection
            ->nfts()
            ->select('nfts.*')
            ->filter($nftFilters, $user)
            ->search($request->get('query'))
            ->when($user, fn ($q) => $q->orderByOwnership($user))
            ->when($sortByMintDate, fn ($q) => $q->orderByMintDate('desc'))
            ->when(! $sortByMintDate, fn ($q) => $q->orderBy('token_number', 'asc'))
            ->paginate($pageLimit)
            ->through(function ($nft) use ($collection) {
                $nft->setRelation('collection', $collection);

                return $nft;
            })
            ->appends($request->all());

        /** @var PaginatedDataCollection<int, GalleryNftData> */
        $paginatedNfts = GalleryNftData::collection($nfts)->through(function (GalleryNftData $data) use ($ownedNftIds) {
            $data->ownedByCurrentUser = $ownedNftIds->contains($data->id);

            return $data;
        });

        return new GalleryNftsData($paginatedNfts);
    }

    private function getActivites(Collection $collection, Request $request, int $activityPageLimit): NftActivitiesData
    {
        $activities = $collection->activities()
                            ->latest('timestamp')
                            ->where('type', '!=', NftTransferType::Transfer)
                            ->paginate($activityPageLimit)
                            ->appends([
                                'tab' => 'activity',
                                'activityPageLimit' => $activityPageLimit,
                            ]);

        /** @var PaginatedDataCollection<int, NftActivityData> */
        $paginated = NftActivityData::collection($activities);

        return new NftActivitiesData($paginated);
    }

    private function getArticles(Collection $collection, Request $request): ArticlesData
    {
        $pageLimit = min($request->has('articlesPageLimit') ? (int) $request->get('articlesPageLimit') : 12, 96);

        $articles = $collection
            ->articlesWithCollections()
            ->paginate($pageLimit);

        /** @var PaginatedDataCollection<int, ArticleData> $paginated */
        $paginated = ArticleData::collection($articles);

        return new ArticlesData($paginated);
    }

    /**
     * @return array<mixed>
     */
    private function parseFilters(Request $request, string $tab, Collection $collection, ?User $user): array
    {
        if ($tab === 'collection') {
            return $this->parseNftFilters($request, $collection, $user);
        }

        return [];
    }

    /**
     * @return array{
     *   owned: bool,
     *   traits: array<string, array<string, string[]>> | null,
     * }
     */
    private function parseNftFilters(Request $request, Collection $collection, ?User $user): array
    {
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
    private function appliedParameters(string $tab, mixed $filters, int $pageLimit): array
    {
        // transform sanitized traits back into the same format as frontend gave us
        $traits = array_key_exists('traits', $filters) ? collect($filters['traits'] ?? [])
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
            ) : null;

        return [
            'owned' => array_key_exists('owned', $filters) ? $filters['owned'] : null,
            'traits' => $traits === null || $traits->isEmpty() ? null : $traits->toArray(),
            'tab' => $tab,
            'pageLimit' => $pageLimit,
        ];
    }
}
