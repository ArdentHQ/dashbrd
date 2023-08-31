<?php

declare(strict_types=1);

namespace App\Rules;

use App\Enums\Period;
use Illuminate\Contracts\Validation\Rule;

final class ValidPeriod implements Rule
{
    public function passes($attribute, $value): bool
    {
        return Period::isValid($value);
    }

    public function message(): string
    {
        return trans('validation.unsupported_period');
    }
}
