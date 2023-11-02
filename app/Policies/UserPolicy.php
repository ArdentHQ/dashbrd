<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

final class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('user:viewAny', 'admin');
    }

    public function view(User $user, User $targetUser): bool
    {
        if ($user->is($targetUser)) {
            return true;
        }

        return $user->hasPermissionTo('user:view', 'admin');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('user:create', 'admin');
    }

    public function update(User $user, User $targetUser): bool
    {
        if ($user->is($targetUser)) {
            return true;
        }

        return $user->hasPermissionTo('user:updateAny', 'admin');
    }

    public function delete(User $user, User $targetUser): bool
    {
        // Cannot delete self
        if ($user->is($targetUser)) {
            return false;
        }

        return $user->hasPermissionTo('user:deleteAny', 'admin');
    }

    public function assignPermissions(User $user): bool
    {
        return $user->hasPermissionTo('user:assignPermissions', 'admin');
    }
}
