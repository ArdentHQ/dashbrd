<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\CollectionWinner;
use App\Models\Wallet;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Seeder;

class CollectionVotesSeeder extends Seeder
{
    /**
     * @throws Exception
     */
    public function run(): void
    {
        $existingIds = [];

        collect([2023])->crossJoin(range(7, 12))->each(function ($item) use ($existingIds) {
            [$year, $month] = $item;

            $collections = Collection::inRandomOrder()->whereNotIn('id', $existingIds)->limit(3)->get();

            if (count($collections) < 3) {
                return;
            }

            $existingIds = array_merge($existingIds, $collections->modelKeys());

            $collections->each(function ($collection, $index) use ($year, $month) {
                $votes = [
                    random_int(11, 15),
                    random_int(6, 10),
                    random_int(1, 5),
                ][$index];

                $voteTime = now()->setYear($year)->setMonth($month)->subMonth();

                for ($i = 0; $i < $votes; $i++) {
                    $collection->votes()->create([
                        'wallet_id' => Wallet::factory()->create()->id,
                        'voted_at' => Carbon::createFromTimestamp(random_int($voteTime->startOfMonth()->timestamp, $voteTime->endOfMonth()->timestamp)),
                    ]);
                }

                if (now()->year !== $year || now()->month !== $month) {
                    CollectionWinner::factory()->for($collection)->create([
                        'rank' => $index + 1,
                        'votes' => $votes,
                        'month' => $month,
                        'year' => $year,
                    ]);
                }
            });
        });
    }
}
