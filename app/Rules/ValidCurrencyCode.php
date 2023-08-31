<?php

declare(strict_types=1);

namespace App\Rules;

use App\Support\Currency;
use Illuminate\Contracts\Validation\Rule;

final class ValidCurrencyCode implements Rule
{
    public function passes($attribute, $value): bool
    {
        return Currency::codes()->contains(strtoupper($value));
    }

    public function message(): string
    {
        return trans('validation.unsupported_currency_code');
    }
}
