<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\CoingeckoToken;
use App\Models\Token;
use Illuminate\Support\Collection;

class CoingeckoTokenObserver
{
    /**
     * Handle the Token "created" event.
     */
    public function created(CoingeckoToken $token): void
    {
        $this->tokens($token)->each(function ($token) {
            $token->spamToken()->delete();
        });
    }

    /**
     * Handle the token "trashed" event.
     */
    public function trashed(CoingeckoToken $token): void
    {
        $this->tokens($token)->each(function ($token) {
            $token->spamToken()->upsert([
                'token_id' => $token['id'],
                'reason' => 'trashed',
            ], ['token_id'], ['reason']);
        });
    }

    /**
     * Handle the token "restored" event.
     */
    public function restored(CoingeckoToken $token): void
    {
        $this->tokens($token)->each(function ($token) {
            $token->spamToken()->delete();
        });
    }

    /**
     * @return Collection<int, Token>
     */
    private function tokens(CoingeckoToken $token): Collection
    {
        return Token::whereHas('tokenGuid', fn ($query) => $query
            ->where('guid', $token->coingecko_id)
        )->get();
    }
}
