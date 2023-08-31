<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Permission;
use App\Support\PermissionRepository;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        Cache::forget('permissions');

        $permissions = PermissionRepository::all();

        /**
         * @var array<string, string> $roles
         */
        $roles = config('permission.roles');

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        Permission::insert($permissions->map(static fn ($permission) => [
            'name' => $permission,
            'guard_name' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ])->all());

        collect($roles)->each(static fn ($permissions, $role) => Role::create([
            'name' => $role,
            'guard_name' => 'admin',
        ])->givePermissionTo($permissions));
    }
}
