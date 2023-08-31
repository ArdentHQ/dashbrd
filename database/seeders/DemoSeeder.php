<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        Cache::clear();

        // Seed data but ignore the dummy NFTs
        $this->call(PermissionSeeder::class);
        $this->call(AdminUserSeeder::class);
        $this->call(UserRoleSeeder::class);
        $this->call(NetworkSeeder::class);
        $this->call(TokenSeeder::class);
        $this->call(CoingeckoTokenSeeder::class);
        $this->call(UserSeeder::class);
        $this->call(BalanceSeeder::class);

        $this->call(LiveUserSeeder::class);

        $this->call(GallerySeeder::class);

        Cache::clear();
    }
}
