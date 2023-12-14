<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionData;
use App\Data\Collections\CollectionStatsData;
use App\Enums\Chain;
use App\Enums\CurrencyCode;
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

        $collections = Collection::query()
            ->searchByName($request->get('query'))
            ->when($request->query('sort') !== 'floor-price', fn ($q) => $q->orderBy('volume', 'desc')) // TODO: order by top...
            ->filterByChainId($chainId)
            ->orderByFloorPrice('desc', $currency)
            ->with([
                'network',
                'floorPriceToken',
                'nfts' => fn ($q) => $q->limit(4),
            ])
            ->withCount('nfts')
            ->addSelectVolumeFiat($currency)
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

        return Inertia::render('Collections/PopularCollections/Index', [
            'title' => trans('metatags.popular-collections.title'),
            'allowsGuests' => true,
            'collections' => CollectionData::collection(
                $collections->through(fn ($collection) => CollectionData::fromModel($collection, $currency))
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
