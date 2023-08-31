<?php

declare(strict_types=1);

namespace App\Policies\Concerns;

use App\Models\User;
use App\Support\PermissionRepository;

trait HasDefaultPolicyRules
{
    protected function hasPermissionTo(User $user, string $action): bool
    {
        $permission = sprintf('%s:%s', $this->resourceName, $action);

        if (! PermissionRepository::exists($permission)) {
            return false;
        }

        return $user->hasPermissionTo($permission, 'admin');
    }
}
