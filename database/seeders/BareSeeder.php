<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class BareSeeder extends Seeder
{
    public function run(): void
    {
        Cache::clear();

        $this->call(AdminUserSeeder::class);
        $this->call(UserRoleSeeder::class);
        $this->call(NetworkSeeder::class);
        $this->call(CoingeckoTokenSeeder::class);
        $this->call(TokenSeeder::class);

        Cache::clear();
    }
}
