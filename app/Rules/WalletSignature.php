<?php

declare(strict_types=1);

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

final class WalletSignature implements Rule
{
    /**
     * @var string
     */
    public const REGEX = '/^0x([A-Fa-f0-9]{130})$/';

    public function passes($attribute, $value): bool
    {
        return boolval(preg_match(self::REGEX, $value));
    }

    public function message(): string
    {
        return trans('auth.validation.invalid_signature');
    }
}
