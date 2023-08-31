<?php

declare(strict_types=1);

namespace App\Rules;

use App\Models\Network;
use Illuminate\Contracts\Validation\Rule;

final class ValidChain implements Rule
{
    public function passes($attribute, $value): bool
    {
        return Network::where('chain_id', $value)
            ->whereIn('chain_id', Network::activeChainIds())->exists();
    }

    public function message(): string
    {
        return trans('auth.validation.invalid_network');
    }
}
