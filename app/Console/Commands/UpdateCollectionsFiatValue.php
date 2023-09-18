<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Collection;
use App\Models\User;
use App\Support\Queues;
use Illuminate\Console\Command;
use Illuminate\Support\Collection as EloquentCollection;

class UpdateCollectionsFiatValue extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:update-fiat-value';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Updates the collection fiat value based on the token price and floor price';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $usersIndex = 0;

        User::query()->select('id')->chunkById(50, function (EloquentCollection $users) use (&$usersIndex) {
            dispatch(function () use ($users) {
                User::updateCollectionsValue($users->pluck('id')->toArray());
            })
                ->delay(now()->addMinutes($usersIndex * 15))
                ->onQueue(Queues::SCHEDULED_DEFAULT);

            $usersIndex++;
        });

        $collectionsIndex = 0;

        Collection::query()->select('id')->chunkById(50, function (EloquentCollection $collections) use (&$collectionsIndex) {
            dispatch(function () use ($collections) {
                Collection::updateFiatValue($collections->pluck('id')->toArray());
            })
                ->delay(now()->addMinutes($collectionsIndex * 15))
                ->onQueue(Queues::SCHEDULED_DEFAULT);

            $collectionsIndex++;
        });

        return Command::SUCCESS;
    }
}
