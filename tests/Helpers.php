<?php

declare(strict_types=1);

use App\Support\PermissionRepository;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

function setUpPermissions(string $guard = 'admin'): void
{
    /**
     * @var array<string, string> $roles
     */
    $roles = config('permission.roles');

    $permissions = PermissionRepository::all();

    collect($roles)->each(static fn ($permissions, $role) => Role::where('name', $role)->first()->givePermissionTo($permissions));

    app()[PermissionRegistrar::class]->forgetCachedPermissions();
}
