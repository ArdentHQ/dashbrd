<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Spatie\Permission\Models\Role;

final class RolePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('user:assignPermissions', 'admin');
    }

    public function view(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('user:assignPermissions', 'admin');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('user:assignPermissions', 'admin');
    }

    public function update(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('user:assignPermissions', 'admin');
    }

    public function delete(User $user, Role $role): bool
    {
        if (! $user->hasPermissionTo('user:assignPermissions', 'admin')) {
            return false;
        }

        return $role->users->isEmpty();
    }
}
