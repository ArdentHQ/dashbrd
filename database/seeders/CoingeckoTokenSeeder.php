<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Platforms;
use App\Http\Client\MarketData\Data\CoingeckoTokens;
use App\Models\CoingeckoToken;
use Illuminate\Database\Seeder;

class CoingeckoTokenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = json_decode(file_get_contents(database_path('seeders/fixtures/coingecko/tokens_list.json')), true);

        $filteredData = [];

        foreach ($data as $item) {
            $filteredPlatforms = array_intersect_key($item['platforms'], array_flip(Platforms::platforms()));

            $filteredData[] = [
                'id' => $item['id'],
                'symbol' => $item['symbol'],
                'name' => $item['name'],
                'platforms' => $filteredPlatforms,
            ];
        }

        CoingeckoToken::insert((new CoingeckoTokens($filteredData))->list());
    }
}
