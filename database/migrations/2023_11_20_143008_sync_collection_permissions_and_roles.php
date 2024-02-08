<?php

declare(strict_types=1);

use App\Models\Permission;
use App\Models\Role;
use App\Support\PermissionRepository;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Cache::forget('permissions');

        $permissions = PermissionRepository::all()->map(static fn ($permission) => [
            'name' => $permission,
            'guard_name' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ])->all();

        // Sync permissions by name
        Permission::upsert($permissions, ['name', 'guard_name'], []);

        /**
         * @var array<string, string> $roles
         */
        $roles = config('permission.roles');

        $rolesData = collect($roles)->map(static fn ($permissions, $role) => [
            'name' => $role,
            'guard_name' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ])->all();

        Role::upsert($rolesData, ['name', 'guard_name'], []);

        $permissions = PermissionRepository::all();

        collect($roles)->each(static fn ($permissions, $role) => Role::where('name', $role)->first()->givePermissionTo($permissions));

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

    }
};
