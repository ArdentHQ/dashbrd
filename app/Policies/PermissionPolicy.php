<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Spatie\Permission\Models\Permission;

final class PermissionPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('user:assignPermissions', 'admin');
    }

    public function view(User $user, Permission $permission): bool
    {
        return $user->hasPermissionTo('user:assignPermissions', 'admin');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('user:assignPermissions', 'admin');
    }

    public function update(User $user, Permission $permission): bool
    {
        return $user->hasPermissionTo('user:assignPermissions', 'admin');
    }

    public function delete(User $user, Permission $permission): bool
    {
        return $user->hasPermissionTo('user:assignPermissions', 'admin');
    }
}
