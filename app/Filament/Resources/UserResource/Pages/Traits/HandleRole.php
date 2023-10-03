<?php

declare(strict_types=1);

namespace App\Filament\Resources\UserResource\Pages\Traits;

use App\Enums\Role;
use App\Models\User;

trait HandleRole
{
    private function setRole(User $model, string $role): void
    {
        /** @var User */
        $user = auth()->user();

        $validRoles = [Role::Editor->value];

        if ($user->hasRole(Role::Admin->value)) {
            $validRoles[] = Role::Admin->value;
        } elseif ($user->hasRole(Role::Superadmin->value)) {
            $validRoles[] = Role::Admin->value;
            $validRoles[] = Role::Superadmin->value;
        }

        if (in_array($role, $validRoles)) {
            $model->syncRoles([$role]);
        }
    }
}
