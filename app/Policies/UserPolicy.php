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
        return $user->hasPermissionTo('user:view', 'admin');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('user:create', 'admin');
    }

    public function update(User $user, User $targetUser): bool
    {
        if ($user->hasPermissionTo('user:updateAny', 'admin')) {
            return true;
        }

        // If users can create, they can update their own
        return $this->create($user) && $user->is($targetUser);
    }

    public function delete(User $user, User $targetUser): bool
    {
        // Cannot delete self
        if ($user->is($targetUser->user)) {
            return false;
        }

        return $user->hasPermissionTo('user:deleteAny', 'admin');
    }
}
