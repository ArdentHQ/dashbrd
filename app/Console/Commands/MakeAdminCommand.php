<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\Role;
use App\Models\Role as RoleModel;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MakeAdminCommand extends Command
{
    protected $signature = 'make:admin';

    protected $description = 'Create a new admin user';

    public function handle(): int
    {
        $email = $this->ask("Enter the admin user's email address");
        $password = $this->secret("Enter the admin user's password");

        $role = $this->choice('Select the role assigned to the admin user', ['Administrator', 'Super Administrator']);

        if (User::where('email', $email)->exists()) {
            $this->error('User with this email address already exists.');

            return Command::INVALID;
        }

        $role = RoleModel::firstWhere('name', $role === 'Administrator' ? Role::Admin->value : Role::Superadmin->value);

        DB::transaction(static function () use ($email, $password, $role) {
            $user = User::create([
                'email' => $email,
                'email_verified_at' => now(),
                'password' => Hash::make($password),
            ]);
            $user->assignRole([$role]);
        });

        $this->info('Admin user has been created.');

        return Command::SUCCESS;
    }
}
