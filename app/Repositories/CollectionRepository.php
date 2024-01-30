<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Data\Collections\VotableCollectionData;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Models\Collection;
use App\Models\CollectionWinner;
use App\Models\User;
use Illuminate\Support\Collection as LaravelCollection;
use Illuminate\Support\Facades\Cache;

class CollectionRepository
{
    /**
     * Get all currently featured collections.
     *
     * @return LaravelCollection<int, Collection>
     */
    public function featured(): LaravelCollection
    {
        $ttl = now()->addHour();

        return Cache::remember('featured-collections', $ttl, function () {
            return Collection::featured()->with([
                'network',
                'floorPriceToken',
                'nfts' => fn ($q) => $q->inRandomOrder()->limit(3),
            ])->get();
        });
    }

    /**
     * Get all of the collections that the user can vote for.
     *
     * @return LaravelCollection<int, VotableCollectionData>
     */
    public function votable(?User $user): LaravelCollection
    {
        $currency = $user?->currency() ?? CurrencyCode::USD;

        $ttl = now()->addHours(3);

        return Cache::tags('votable-collections')->remember($currency->canonical(), $ttl, function () use ($user, $currency) {
            $winners = CollectionWinner::ineligibleCollectionIds();
            $userHasAlreadyVoted = $user !== null ? Collection::votedByUserInCurrentMonth($user)->exists() : false;

            $collections = Collection::votable()
                            ->withCount(['votes' => fn ($q) => $q->inCurrentMonth()])
                            ->orderBy('votes_count', 'desc')
                            ->orderByVolume(Period::MONTH, $currency)
                            ->with('network.nativeToken')
                            ->get();

            return $collections->take(13)->map(fn ($collection) => VotableCollectionData::fromModel(
                $collection,
                $currency,
                showVotes: $userHasAlreadyVoted,
                alreadyWon: $winners->contains($collection->id),
            ));
        });
    }
}
