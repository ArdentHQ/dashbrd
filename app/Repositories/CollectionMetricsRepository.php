<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Data\Collections\CollectionStatsData;
use App\Enums\CurrencyCode;
use App\Models\Collection;
use App\Models\Nft;
use App\Models\User;
use App\Support\Cache\UserCache;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CollectionMetricsRepository
{
    /**
     * Get the total metrics for collections in a given currency.
     */
    public function total(CurrencyCode $currency): CollectionStatsData
    {
        $stats = Cache::remember('popular-collections-stats', now()->addHour(), fn () => [
            'fiatValues' => collect(Collection::getFiatValueSum()),
            'collectionsCount' => Collection::count(),
            'nftsCount' => Nft::count(),
        ]);

        return new CollectionStatsData(
            nfts: $stats['nftsCount'],
            collections: $stats['collectionsCount'],
            value: (float) $stats['fiatValues']->where('key', $currency->value)->first()?->total ?: 0
        );
    }

    /**
     * Generate the metrics for the user's collections.
     */
    public function forUser(User $user, bool $showHidden): CollectionStatsData
    {
        $cache = new UserCache($user);

        $cacheKey = $showHidden
                        ? "users:{$user->id}:total-hidden-collection-value"
                        : "users:{$user->id}:total-collection-value";

        $value = (float) Cache::remember($cacheKey, now()->addMinutes(30), fn () => $this->totalValueForUser($user, $showHidden));

        return new CollectionStatsData(
            nfts: $showHidden ? $cache->hiddenNftsCount() : $cache->shownNftsCount(),
            collections: $showHidden ? $cache->hiddenCollectionsCount() : $cache->shownCollectionsCount(),
            value: $value,
        );
    }

    /**
     * Generate the dummy metrics data filled with zeros.
     */
    public function zeros(): CollectionStatsData
    {
        return new CollectionStatsData(
            nfts: 0,
            collections: 0,
            value: 0,
        );
    }

    /**
     * Compute the total fiat value for user's collections by summing up the `fiat_value` columns for all of collections associated with the user.
     */
    private function totalValueForUser(User $user, ?bool $onlyHidden): float
    {
        return (float) Nft::query()
                        ->leftJoin('collections', 'collections.id', '=', 'nfts.collection_id')
                        ->when($onlyHidden === true, fn ($q) => $q->whereIn('collection_id', $user->hiddenCollections->modelKeys()))
                        ->when($onlyHidden === false, fn ($q) => $q->whereNotIn('collection_id', $user->hiddenCollections->modelKeys()))
                        ->where('wallet_id', $user->wallet_id)
                        ->sum(DB::raw("coalesce((fiat_value->'{$user->currency()->value}')::numeric, 0)"));
    }
}
