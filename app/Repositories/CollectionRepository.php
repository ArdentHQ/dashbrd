<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Enums\Chain;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Models\Collection;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as LaravelCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection as LaravelCollection;
use Illuminate\Support\Facades\Cache;

class CollectionRepository
{
    /**
     * Get all of the collections that the user can vote on.
     *
     * @return LaravelCollection<int, Collection>
     */
    public function votable(?User $user): LaravelCollection
    {
        return Collection::query()
                        ->withCount([
                            'nfts',
                            'votes' => fn ($q) => $q->inCurrentMonth(),
                        ])
                        ->orderBy('votes_count', 'desc')
                        ->orderByVolume(Period::MONTH, $user?->currency() ?? CurrencyCode::USD)
                        ->with([
                            'network.nativeToken',
                            'floorPriceHistory' => fn ($q) => $q->where('retrieved_at', '>=', now()->subDays(1)->startOfDay()),
                            'floorPriceToken',
                        ])
                        ->when($user === null, fn ($q) => $q->limit(13))
                        ->when($user !== null, fn ($q) => $q->limit(700))
                        ->get();
    }

    /**
     * Search the nominatable collections.
     *
     * @return LaravelCollection<int, Collection>
     */
    public function nominatable(?string $searchQuery, CurrencyCode $currency): LaravelCollection
    {
        return Collection::query()
                            ->with([
                                'network.nativeToken',
                                'floorPriceToken',
                                'floorPriceHistory' => fn ($q) => $q->where('retrieved_at', '>=', now()->subDays(1)->startOfDay()),
                            ])
                            ->searchByName($searchQuery)
                            ->limit(15)
                            ->withCount(['nfts', 'votes' => fn ($q) => $q->inCurrentMonth()])
                            ->orderBy('votes_count', 'desc')
                            ->orderByVolume(period: Period::MONTH, currency: $currency)
                            ->get();
    }

    /*
     * Get all of the currently featured collections.
     *
     * @return LaravelCollection<int, Collection>
     */
    public function featured(): LaravelCollection
    {
        $ttl = now()->addHour();

        $collections = Cache::remember('featured-collections', $ttl, function () {
            return Collection::featured()->with([
                'network',
                'network.nativeToken',
                'floorPriceToken',
                'nfts' => fn ($q) => $q->inRandomOrder()->limit(3),
            ])->get();
        });

        return $collections->map(function (Collection $collection) {
            $collection->nfts->each->setRelation('collection', $collection);

            return $collection;
        });
    }

    /**
     * Get all of the popular collections that match the given filters.
     *
     * @return LengthAwarePaginator<Collection>
     */
    public function allPopular(
        ?string $searchQuery, Period $period, CurrencyCode $currency, int $perPage, ?Chain $chain, ?string $sortBy, string $order
    ): LengthAwarePaginator {
        return Collection::query()
                    ->searchByName($searchQuery)
                    ->when($sortBy === null, fn ($q) => $q->orderByVolume($period, currency: $chain === null ? $currency : null))
                    ->when($sortBy === 'name', fn ($q) => $q->orderByName($order))
                    ->when($sortBy === 'value', fn ($q) => $q->orderByValue(null, $order, $currency))
                    ->when($sortBy === 'floor-price', fn ($q) => $q->orderByFloorPrice($order, $currency))
                    ->when($sortBy === 'chain', fn ($q) => $q->orderByChainId($order))
                    ->filterByChainId($chain?->value)
                    ->orderByFloorPrice('desc', $currency)
                    ->with([
                        'network',
                        'network.nativeToken',
                        'floorPriceToken',
                        'nfts' => fn ($q) => $q->limit(4),
                        'floorPriceHistory' => fn ($q) => $q->where('retrieved_at', '>=', now()->subDays(1)->startOfDay()),
                    ])
                    ->withCount('nfts')
                    ->paginate($perPage)
                    ->withQueryString();
    }
}
