<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Str;

class BlacklistedCollections
{
    public static function includes(string $address): bool
    {
        /**
         * @var string[]
         */
        $blacklisted = config('dashbrd.blacklisted_collections', []);

        return collect($blacklisted)
                        ->map(fn ($collection) => Str::lower($collection))
                        ->contains(Str::lower($address));
    }
}
