<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Enums\CurrencyCode;
use App\Models\Gallery;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class GalleriesRepository
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
                ])
                ->when($user !== null, fn ($q) => $q->with([
                    'likes' => fn ($q) => $q->where('user_id', $user->id),
                ])) // Only load likes that are submitted by the user, this prevents too many models in memory. As we limit likes to only 1 per user, this will contain 1 model...
                ->limit(8);
    }
}
