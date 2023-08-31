<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

final class PermissionRepository
{
    /**
     * @return Collection<int, string>
     */
    public static function all(): Collection
    {
        $ttl = now()->addDays(5);
        /** @var array<string, mixed> $roles */
        $roles = config('permission.roles');

        return Cache::remember('permissions', $ttl, static fn () => collect($roles)->flatten()->unique()->values());
    }

    public static function exists(string $permission): bool
    {
        return self::all()->contains($permission);
    }
}
