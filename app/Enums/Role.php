<?php

declare(strict_types=1);

namespace App\Enums;

enum Role: string
{
    case Superadmin = 'superadmin';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Superadmin => 'Super Administrator',
            self::Admin => 'Administrator',
        };
    }
}
