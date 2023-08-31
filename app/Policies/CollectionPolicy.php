<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Collection;
use App\Models\User;

final class CollectionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('user:viewAny', 'admin');
    }

    public function view(User $user, Collection $collection): bool
    {
        return $user->hasPermissionTo('user:view', 'admin');
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Collection $collection): bool
    {
        return false;
    }

    public function delete(User $user, Collection $collection): bool
    {
        return false;
    }

    public function restore(User $user, Collection $collection): bool
    {
        return false;
    }

    public function forceDelete(User $user, Collection $collection): bool
    {
        return false;
    }
}
