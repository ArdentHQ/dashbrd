<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Collection;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class WinnerCollectionSeeder extends Seeder
{
    public function run(): void
    {
        $this->generateWinners(Carbon::now()->year);
        $this->generateWinners(Carbon::now()->subYear()->year);
    }

    public function generateWinners(int $year): void
    {

        for ($month = 1; $month <= 12; $month++) {

            $monthlyWinnerCollections = Collection::query()
                ->whereNull('has_won_at')
                ->limit(3)
                ->get();

            $currentDate = Carbon::createFromDate($year, $month, 1);

            $monthlyWinnerCollections->each(function ($collection) use ($currentDate) {
                $collection->update(['has_won_at' => $currentDate->toString()]);
            });

        }
    }
}
