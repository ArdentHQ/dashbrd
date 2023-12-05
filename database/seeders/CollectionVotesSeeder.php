<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\Wallet;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection as IlluminateCollection;

class CollectionVotesSeeder extends Seeder
{
    private IlluminateCollection $excludedCollections;

    public function __construct()
    {
        $this->excludedCollections = collect();
    }

    /**
     * @throws Exception
     */
    public function run(): void
    {
        // now - 4 months - 1 winner
        $this->addVotes(collectionsCount: 1, winnerCount: 1, subMonths: 4);

        // now - 3 months - 2 winners
        $this->addVotes(collectionsCount: 2, winnerCount: 2, subMonths: 3);

        // now - 2 months - 3 winners
        $this->addVotes(collectionsCount: 3, winnerCount: 3, subMonths: 2);

        // now - 1 month - 3 winners - 8 nominated
        $this->addVotes(collectionsCount: 8, winnerCount: 3, subMonths: 1);

        // current month - 0 winners - 5 nominated
        $this->addVotes(collectionsCount: 5, winnerCount: 0, subMonths: 0);
    }

    /**
     * @throws Exception
     */
    private function addVotes(int $collectionsCount, int $winnerCount, int $subMonths)
    {
        $randomCollections = Collection::query()
            ->whereNotIn('id', $this->excludedCollections)
            ->inRandomOrder()
            ->limit($collectionsCount)
            ->get();

        if ($randomCollections->count() < $collectionsCount) {
            throw new Exception("Couldn't find enough collections to vote");
        }

        $this->excludedCollections->push(...$randomCollections->take($winnerCount)->pluck('id'));

        $votedAt = Carbon::now()->subMonths($subMonths);

        $randomCollections->map(function ($collection, $index) use ($votedAt, $collectionsCount, $winnerCount) {
            $voteCount = $collectionsCount > $winnerCount && $winnerCount - $index > 0 ? $winnerCount - $index + 1 : 1;

            for ($i = 0; $i < $voteCount; $i++) {
                $collection->votes()->create([
                    'wallet_id' => Wallet::factory()->create()->id,
                    'voted_at' => $votedAt,
                ]);
            }
        });
    }
}
