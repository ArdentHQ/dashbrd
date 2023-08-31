<?php

declare(strict_types=1);

namespace App\Rules;

use App\Models\Token;
use Illuminate\Contracts\Validation\Rule;

final class ValidTokenSymbol implements Rule
{
    public function passes($attribute, $value): bool
    {
        return Token::bySymbol($value)->exists();
    }

    public function message(): string
    {
        return trans('validation.unsupported_token_symbol');
    }
}
