<?php

declare(strict_types=1);

use App\Support\PermissionRepository;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

function setUpPermissions(string $guard = 'admin'): void
{
    $permissions = PermissionRepository::all();
    $roles = config('permission.roles');

    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    Permission::insert($permissions->map(fn ($permission) => [
        'name' => $permission,
        'guard_name' => $guard,
        'created_at' => now(),
        'updated_at' => now(),
    ])->all());

    collect($roles)->each(fn ($permissions, $role) => Role::create([
        'name' => $role,
        'guard_name' => $guard,
    ])->givePermissionTo($permissions));
}
