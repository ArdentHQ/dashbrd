<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Features;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Laravel\Pennant\Feature;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Cache::clear();

        $this->call(PermissionSeeder::class);
        $this->call(AdminUserSeeder::class);
        $this->call(UserRoleSeeder::class);
        $this->call(NetworkSeeder::class);
        $this->call(CoingeckoTokenSeeder::class);
        $this->call(TokenSeeder::class);

        if (Feature::active(Features::Portfolio->value)) {
            $this->call(TokenPriceHistorySeeder::class);
        }

        $this->call(UserSeeder::class);

        if (Feature::active(Features::Portfolio->value)) {
            $this->call(BalanceSeeder::class);
        }

        if (Feature::active(Features::Collections->value) || Feature::active(Features::Galleries->value)) {
            $this->call(NftSeeder::class);
        }

        if (Feature::active(Features::Galleries->value)) {
            $this->call(GallerySeeder::class);
            $this->call(GalleryLikesSeeder::class);
        }

        if (Feature::active(Features::Articles->value)) {
            $this->call(ArticleSeeder::class);
        }

        Cache::clear();
    }
}
