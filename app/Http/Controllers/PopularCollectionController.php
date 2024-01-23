<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionData;
use App\Data\Collections\CollectionStatsData;
use App\Enums\Chain;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Http\Controllers\Traits\HasCollectionFilters;
use App\Models\Collection;
use App\Models\Nft;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class PopularCollectionController extends Controller
{
    use HasCollectionFilters;

    public function index(Request $request): Response|JsonResponse|RedirectResponse
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
            ->when($sortBy === null, fn ($q) => $q->orderByVolume($period))
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
            ->addSelect('collections.*')
            ->groupBy('collections.id')
            ->paginate($perPage)
            ->withQueryString();

        $stats = Cache::remember('popular-collections-stats', now()->addHour(), function () {
            return [
                'fiatValues' => collect(Collection::getFiatValueSum()),
                'collectionsCount' => Collection::query()->count(),
                'nftsCount' => Nft::query()->count(),
            ];
        });

        return Inertia::render('Collections/CollectionsCatalog/Index', [
            'title' => trans('metatags.popular-collections.title'),
            'allowsGuests' => true,
            'collections' => CollectionData::collection(
                $collections->through(fn ($collection) => CollectionData::fromModel($collection, $currency, volumePeriod: $period))
            ),
            'stats' => new CollectionStatsData(
                nfts: $stats['nftsCount'],
                collections: $stats['collectionsCount'],
                value: (float) $stats['fiatValues']->where('key', $currency->value)->first()?->total ?: 0
            ),
            'filters' => $this->getFilters($request),
        ]);
    }
}
