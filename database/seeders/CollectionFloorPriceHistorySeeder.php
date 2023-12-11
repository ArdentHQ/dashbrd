<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\FloorPriceHistory;
use Exception;
use Illuminate\Database\Seeder;

class CollectionFloorPriceHistorySeeder extends Seeder
{
    /**
     * @throws Exception
     */
    public function run(): void
    {
        $collections = Collection::all();

        $data = $collections->flatMap(function (Collection $collection) {
            // 30% chance of no entries, 70% chance of 1-10 entries
            $totalEntries = fake()->boolean(30) ? 0 : fake()->numberBetween(1, 10);

            return collect(range(0, $totalEntries))->map(fn ($index) => FloorPriceHistory::factory()->raw([
                'collection_id' => $collection->id,
            ]))->sortBy('retrieved_at')->toArray();
        })->toArray();

        FloorPriceHistory::insert($data);

    }
}
