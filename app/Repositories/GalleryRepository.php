<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Enums\CurrencyCode;
use App\Models\Gallery;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class GalleryRepository
{
    /**
     * @return Collection<int, Gallery>
     */
    public function popular(?User $user): Collection
    {
        return $this->modifyQueryForIndex(
            query: Gallery::popular(),
            user: $user
        )->get();
    }

    /**
     * @return Collection<int, Gallery>
     */
    public function latest(?User $user): Collection
    {
        return $this->modifyQueryForIndex(
            query: Gallery::latest(),
            user: $user
        )->get();
    }

    /**
     * @return Collection<int, Gallery>
     */
    public function mostValuable(?User $user): Collection
    {
        return $this->modifyQueryForIndex(
            query: Gallery::mostValuable($user?->currency() ?? CurrencyCode::USD),
            user: $user
        )->get();
    }

    /**
     * @param  "most-valuable"|"newest"|"most-popular"  $filter
     * @return LengthAwarePaginator<Gallery>
     */
    public function all(?User $user, string $filter, ?string $searchQuery): LengthAwarePaginator
    {
        $query = Gallery::query()
                    ->when($filter === 'most-popular', fn ($q) => $q->popular())
                    ->when($filter === 'most-valuable', fn ($q) => $q->mostValuable($user?->currency() ?? CurrencyCode::USD))
                    ->when($filter === 'newest', fn ($q) => $q->latest())
                    ->search($searchQuery);

        return $this->modifyQueryForIndex(
            query: $query,
            user: $user,
        )->paginate(12);
    }

    /**
     * @return LengthAwarePaginator<Gallery>
     */
    public function forUser(User $user): LengthAwarePaginator
    {
        return $this->modifyQueryForIndex(
            query: Gallery::where('user_id', $user->id),
            user: $user,
        )->paginate(12);
    }

    /**
     * Modify the query instance to apply relationships and limits used on the galleries index page.
     *
     * @param  Builder<Gallery>  $query
     * @return Builder<Gallery>
     */
    private function modifyQueryForIndex(Builder $query, ?User $user): Builder
    {
        return $query
                ->withCount('views', 'nfts', 'likes')
                ->with([
                    'user.wallet.details',
                    'nfts' => fn ($q) => $q->orderByPivot('order_index', 'asc')->limit(6),
                    'nfts.collection.network',
                    'nfts.collection.floorPriceToken',
                ])
                ->when($user !== null, fn ($q) => $q->with([
                    'likes' => fn ($q) => $q->where('user_id', $user->id),
                ])) // Only load likes that are submitted by the user, this prevents too many models in memory. As we limit likes to only 1 per user, this will contain 1 model...
                ->limit(8);
    }
}
