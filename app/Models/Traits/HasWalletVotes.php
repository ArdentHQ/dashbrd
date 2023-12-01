<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Models\CollectionVote;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\HasMany;

trait HasWalletVotes
{
    /**
     * @return HasMany<CollectionVote>
     */
    public function votes(): HasMany
    {
        return $this->hasMany(CollectionVote::class);
    }

    public function addVote(Wallet $wallet): void
    {
        $this->votes()->updateOrCreate([
            'wallet_id' => $wallet->id,
            'voted_at' => Carbon::now(),
        ]);
    }
}
