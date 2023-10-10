<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        /**
         * @var array<string>
         */
        $users = array_keys(config('permission.user_role'));

        foreach ($users as $email) {
            $password = app()->isLocal() ? 'password' : Str::random(10);

            $this->command->info("Password for $email: $password");

            User::create([
                'email' => $email,
                'email_verified_at' => now(),
                'password' => bcrypt($password),
            ]);
        }
    }
}
