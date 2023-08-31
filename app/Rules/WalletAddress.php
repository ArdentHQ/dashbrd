<?php

declare(strict_types=1);

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

final class WalletAddress implements Rule
{
    /**
     * @var string
     */
    public const REGEX = '/^0x[a-fA-F0-9]{40}$/';

    public function passes($attribute, $value): bool
    {
        return boolval(preg_match(self::REGEX, $value));
    }

    public function message(): string
    {
        return trans('auth.validation.invalid_address');
    }
}
