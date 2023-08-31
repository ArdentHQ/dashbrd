<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        /**
         * @var array<string, string> $roles
         */
        $roles = config('permission.user_role');

        collect($roles)->map(static function ($role, $email) {
            $role = Role::firstWhere('name', $role);
            User::where('email', $email)->first()->assignRole([$role]);
        });
    }
}
