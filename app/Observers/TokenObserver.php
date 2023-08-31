<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Token;
use App\Support\TokenSpam;

class TokenObserver
{
    public bool $afterCommit = true;

    /**
     * Handle the Token "created" event.
     */
    public function created(Token $token): void
    {
        $this->evaluateSpam($token);
    }

    /**
     * Handle the Token "updated" event.
     */
    public function updated(Token $token): void
    {
        $this->evaluateSpam($token);
    }

    private function evaluateSpam(Token $token): void
    {
        $result = TokenSpam::evaluate($token);
        if ($result['isSpam']) {
            $token->spamToken()->upsert([
                'token_id' => $token['id'],
                'reason' => $result['reason'],
            ], ['token_id'], ['reason']);
        } else {
            $token->spamToken()->delete();
        }
    }
}
