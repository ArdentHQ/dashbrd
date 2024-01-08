<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class LiveSeeder extends Seeder
{
    public function run(): void
    {
        Cache::clear();

        $this->call(DatabaseSeeder::class);
        $this->call(LiveUserSeeder::class);

        Cache::clear();
    }
}
