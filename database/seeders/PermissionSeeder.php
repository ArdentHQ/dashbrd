<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Support\PermissionRepository;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        /**
         * @var array<string, string> $roles
         */
        $roles = config('permission.roles');

        $permissions = PermissionRepository::all();

        collect($roles)->each(static fn ($permissions, $role) => Role::where('name', $role)->first()->givePermissionTo($permissions));
    }
}
