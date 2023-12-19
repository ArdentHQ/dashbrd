<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\CollectionWinner;
use Illuminate\Database\Seeder;

class WinnerCollectionSeeder extends Seeder
{
    public function run(): void
    {
        $existingIds = [];

        collect([2022, 2023])->crossJoin(range(1, 12))->each(function ($item) use ($existingIds) {
            [$year, $month] = $item;

            $collections = Collection::inRandomOrder()->whereNotIn('id', $existingIds)->limit(3)->get();

            if (count($collections) < 3) {
                return;
            }

            if (now()->year === $year && now()->month === $month) {
                return;
            }

            $existingIds = array_merge($existingIds, $collections->modelKeys());

            $collections->each(fn ($collection, $index) => CollectionWinner::factory()->for($collection)->create([
                'rank' => $index + 1,
                'month' => $month,
                'year' => $year,
            ]));
        });
    }
}
