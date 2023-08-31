<?php

declare(strict_types=1);

namespace App\Data\Collections\Concerns;

use App\Models\Collection;
use App\Models\Nft;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

trait QueriesCollectionNfts
{
    /**
     * @return HasMany<Nft>
     */
    protected static function getCollectionNftsQuery(Collection $collection, ?User $user): HasMany
    {
        if ($user === null) {
            return $collection->nfts();
        }

        return $collection->nfts()->whereHas('wallet', static function (Builder $query) use ($user) {
            $query->where('user_id', $user->id);
        });
    }
}
