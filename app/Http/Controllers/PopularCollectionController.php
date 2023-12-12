<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionData;
use App\Data\Collections\CollectionStatsData;
use App\Enums\Chain;
use App\Enums\CurrencyCode;
use App\Http\Controllers\Traits\HasCollectionFilters;
use App\Models\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $collections = Collection::query()
            ->when($request->query('sort') !== 'floor-price', fn ($q) => $q->orderBy('volume', 'desc')) // TODO: order by top...
            ->filterByChainId($chainId)
            ->orderByFloorPrice('desc', $currency)
            ->with([
                'network',
                'floorPriceToken',
                'nfts' => fn ($q) => $q->limit(4),
            ])
            ->withCount('nfts')
            ->selectVolumeFiat($currency)
            ->addSelect('collections.*')
            ->groupBy('collections.id')
            ->paginate(25);

        return Inertia::render('Collections/PopularCollections/Index', [
            'title' => trans('metatags.popular-collections.title'),
            'allowsGuests' => true,
            'collections' => CollectionData::collection(
                $collections->through(fn ($collection) => CollectionData::fromModel($collection, $currency))
            ),
            'stats' => new CollectionStatsData(
                nfts: 145,
                collections: 25,
                value: 256000,
            ),
            'filters' => $this->getFilters($request),
        ]);
    }
}
