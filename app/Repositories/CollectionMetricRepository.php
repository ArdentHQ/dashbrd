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

class CollectionMetricRepository
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

        return new CollectionStatsData(
            nfts: $showHidden ? $cache->hiddenNftsCount() : $cache->shownNftsCount(),
            collections: $showHidden ? $cache->hiddenCollectionsCount() : $cache->shownCollectionsCount(),
            value: $user->collectionsValue($user->currency(), readFromDatabase: false, onlyHidden: $showHidden),
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
}
