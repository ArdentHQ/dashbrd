<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Articles\ArticleData;
use App\Data\Articles\ArticlesData;
use App\Data\Collections\CollectionDetailData;
use App\Data\Collections\CollectionTraitFilterData;
use App\Data\Collections\PopularCollectionData;
use App\Data\Gallery\GalleryNftData;
use App\Data\Gallery\GalleryNftsData;
use App\Data\Nfts\NftActivitiesData;
use App\Data\Nfts\NftActivityData;
use App\Data\Token\TokenData;
use App\Enums\Chain;
use App\Enums\CurrencyCode;
use App\Enums\NftTransferType;
use App\Enums\TraitDisplayType;
use App\Jobs\FetchCollectionActivity;
use App\Jobs\FetchCollectionBanner;
use App\Jobs\SyncCollection;
use App\Models\Collection;
use App\Models\User;
use App\Support\Queues;
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

        $currency = $user ? $user->currency() : CurrencyCode::USD;

        $collectionQuery = $user ? $user->collections() : Collection::query();

        $chainId = match ($request->query('chain')) {
            'polygon' => Chain::Polygon->value,
            'ethereum' => Chain::ETH->value,
            default => null,
        };

        /** @var LengthAwarePaginator<Collection> $collections */
        $collections = Collection::query()
                                ->when($request->query('sort') !== 'floor-price', fn ($q) => $q->orderBy('volume', 'desc')) // TODO: order by top...
                                ->filterByChainId($chainId)
                                ->orderByFloorPrice('desc', $currency)
                                ->with([
                                    'network',
                                    'floorPriceToken',
                                ])
                                ->simplePaginate(12);

        return Inertia::render('Collections/Index', [
            'allowsGuests' => true,
            'activeSort' => $request->query('sort') === 'floor-price' ? 'floor-price' : 'top',
            'filters' => [
                'chain' => $request->query('chain') ?? null,
            ],
            'title' => trans('metatags.collections.title'),
            'collections' => PopularCollectionData::collection(
                $collections->through(fn ($collection) => PopularCollectionData::fromModel($collection, $currency))
            ),
        ]);
    }

    public function show(Request $request, Collection $collection): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        $sortByMintDate = $request->query('sort') === 'minted';

        $reportAvailableIn = RateLimiterHelpers::collectionReportAvailableInHumanReadable($request, $collection);

        if (! $collection->recentlyViewed()) {
            $bannerUpdatedAt = $collection->bannerUpdatedAt();
            $formattedBannerUpdatedAt = $bannerUpdatedAt ? Carbon::parse($bannerUpdatedAt) : null;

            if ($collection->banner() === null || $formattedBannerUpdatedAt === null || ($formattedBannerUpdatedAt !== null && $formattedBannerUpdatedAt->diffInDays(now()) > 7)) {
                FetchCollectionBanner::dispatch($collection);
            }

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

        // Allow any number but not more than 96
        $nftPageLimit = min($request->has('nftPageLimit') ? (int) $request->get('nftPageLimit') : 24, 96);

        $nfts = $collection
            ->nfts()
            ->select('nfts.*')
            ->filter($filters, $user)
            ->search($request->get('query'))
            ->when($user, fn ($q) => $q->orderByOwnership($user))
            ->when($sortByMintDate, fn ($q) => $q->orderByMintDate('desc'))
            ->when(! $sortByMintDate, fn ($q) => $q->orderBy('token_number', 'asc'))
            ->paginate($nftPageLimit)
            ->through(function ($nft) use ($collection) {
                $nft->setRelation('collection', $collection);

                return $nft;
            })
            ->appends($request->all());

        // Allow any number but not more than 100
        $activityPageLimit = min($request->has('activityPageLimit') ? (int) $request->get('activityPageLimit') : 10, 100);

        $tab = in_array($request->get('tab'), ['collection', 'articles', 'activity']) ? $request->get('tab') : 'collection';
        $hasActivity = $collection->indexesActivities();

        $activities = ($tab === 'activity' && $hasActivity) ? $collection->activities()
                            ->latest('timestamp')
                            ->with(['nft' => fn ($q) => $q->where('collection_id', $collection->id)])
                            ->whereHas('nft', fn ($q) => $q->where('collection_id', $collection->id))
                            ->where('type', '!=', NftTransferType::Transfer)
                            ->paginate($activityPageLimit)
                            ->appends([
                                'tab' => 'activity',
                                'activityPageLimit' => $activityPageLimit,
                            ]) : null;

        /** @var PaginatedDataCollection<int, NftActivityData>|null */
        $paginated = $activities !== null ? NftActivityData::collection($activities) : null;

        $ownedNftIds = $user
                        ? $collection->nfts()->ownedBy($user)->pluck('id')
                        : collect([]);

        /** @var PaginatedDataCollection<int, GalleryNftData> */
        $paginatedNfts = GalleryNftData::collection($nfts)->through(function (GalleryNftData $data) use ($ownedNftIds) {
            $data->ownedByCurrentUser = $ownedNftIds->contains($data->id);

            return $data;
        });

        $nativeToken = $collection->network->tokens()->nativeToken()->defaultToken()->first();

        $currency = $user ? $user->currency() : CurrencyCode::USD;

        return Inertia::render('Collections/View', [
            'initialActivities' => $paginated !== null ? new NftActivitiesData($paginated) : null,
            'hasActivities' => $hasActivity,
            'collection' => CollectionDetailData::fromModel($collection, $currency, $user),
            'isHidden' => $user && $user->hiddenCollections()->where('id', $collection->id)->exists(),
            'previousUrl' => url()->previous() === url()->current()
                ? null
                : url()->previous(),
            'nfts' => new GalleryNftsData($paginatedNfts),
            'collectionTraits' => CollectionTraitFilterData::fromCollection($collection),
            'alreadyReported' => $user && $collection->wasReportedByUserRecently($user),
            'reportAvailableIn' => $reportAvailableIn,
            'appliedFilters' => $this->appliedParameters($request, $activityPageLimit, $nftPageLimit, $tab, $filters),
            'sortByMintDate' => $sortByMintDate,
            'nativeToken' => TokenData::fromModel($nativeToken),
            'allowsGuests' => true,
            'title' => trans('metatags.collections.view.title', ['name' => $collection->name]),
            'showReportModal' => $request->boolean('report'),
        ])->withViewData([
            'title' => trans('metatags.collections.view.title', ['name' => $collection->name]),
            'description' => trans('metatags.collections.view.description', ['name' => $collection->name]),
            'image' => trans('metatags.collections.view.image'),
        ]);
    }

    public function articles(Collection $collection, Request $request): JsonResponse
    {
        $pageLimit = min($request->has('pageLimit') ? (int) $request->get('pageLimit') : 12, 96);

        $articles = $collection
            ->articles()
            ->isPublished()
            ->search($request->get('search'))
            ->when($request->get('sort') !== 'popularity', fn ($q) => $q->sortById())
            ->when($request->get('sort') === 'popularity', fn ($q) => $q->sortByPopularity())
            ->orderByPivot('order_index', 'asc')
            ->withFeaturedCollections()
            ->paginate($pageLimit);

        /** @var PaginatedDataCollection<int, ArticleData> $paginated */
        $paginated = ArticleData::collection($articles);

        return response()->json([
            'articles' => new ArticlesData($paginated),
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
    private function appliedParameters(Request $request, int $activityPageLimit, int $nftPageLimit, string $tab, mixed $filters): array
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
            'activityPageLimit' => $activityPageLimit,
            'nftPageLimit' => $nftPageLimit,
        ];
    }

    public function refreshActivity(Request $request, Collection $collection): JsonResponse
    {

        // Request has already been made after recent update, and job is already scheduled.
        if ($collection->activity_update_requested_at) {
            return response()->json([
                'success' => true,
            ]);
        }

        $hoursUntilNextUpdate = config('dashbrd.idle_time_between_collection_activity_updates', 6);
        $hasBeenRecentlyUpdated = $collection->activity_updated_at && Carbon::now()->diffInHours($collection->activity_updated_at) < $hoursUntilNextUpdate;

        // If activity has been recently updated and it is requested to update it again, dispatch the job with a delay.
        if ($hasBeenRecentlyUpdated && ! $collection->is_fetching_activity) {
            $collection->touch('activity_update_requested_at');
            FetchCollectionActivity::dispatch($collection)->onQueue(Queues::NFTS)->delay(Carbon::now()->addHours($hoursUntilNextUpdate));

            return response()->json([
                'success' => true,
            ]);
        }

        FetchCollectionActivity::dispatch($collection)->onQueue(Queues::NFTS);

        return response()->json([
            'success' => true,
        ]);
    }
}
