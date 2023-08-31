<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Policies\Concerns\HasDefaultPolicyRules;

final class UserPolicy extends Policy
{
    use HasDefaultPolicyRules;

    protected string $resourceName = 'user';

    public function viewAny(User $user): bool
    {
        return $this->hasPermissionTo($user, 'viewAny');
    }

    public function view(User $user, User $targetUser): bool
    {
        if ($targetUser->id === $user->id) {
            return true;
        }

        return $this->hasPermissionTo($user, 'view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermissionTo($user, 'create');
    }

    public function update(User $user, User $targetUser): bool
    {
        if ($user->id === $targetUser->id) {
            return true;
        }

        return false;
    }

    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        return $this->hasPermissionTo($user, 'delete');
    }

    public function restore(User $user): bool
    {
        return $this->hasPermissionTo($user, 'restore');
    }
}
