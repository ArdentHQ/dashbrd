<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionStatsData;
use App\Http\Controllers\Traits\HasCollectionFilters;
use App\Http\Requests\FilterableCollectionRequest;
use App\Models\Collection;
use App\Models\Nft;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class PopularCollectionController extends Controller
{
    use HasCollectionFilters;

    public function index(FilterableCollectionRequest $request): Response
    {
        $currency = $request->currency();

        $stats = Cache::remember('popular-collections-stats', now()->addHour(), fn () => [
            'fiatValues' => collect(Collection::getFiatValueSum()),
            'collectionsCount' => Collection::count(),
            'nftsCount' => Nft::count(),
        ]);

        return Inertia::render('Collections/CollectionsCatalog/Index', [
            'title' => trans('metatags.popular-collections.title'),
            'allowsGuests' => true,
            'stats' => new CollectionStatsData(
                nfts: $stats['nftsCount'],
                collections: $stats['collectionsCount'],
                value: (float) $stats['fiatValues']->where('key', $currency->value)->first()?->total ?: 0
            ),
            'filters' => $this->getFilters($request),
        ]);
    }
}
