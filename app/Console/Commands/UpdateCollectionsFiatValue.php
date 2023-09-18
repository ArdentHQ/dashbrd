<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Collection;
use App\Models\User;
use App\Support\Queues;
use Illuminate\Console\Command;
use Illuminate\Support\Collection as EloquentCollection;
use Illuminate\Support\Facades\Log;

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
        User::query()->select('id')->chunkById(50, function (EloquentCollection $users) {
            dispatch(function () use ($users) {
                $ids = $users->pluck('id')->toArray();

                User::updateCollectionsValue($ids);

                Log::info('Updated Users Collections Fiat Value', [
                    'users' => $ids,
                ]);
            })->onQueue(Queues::SCHEDULED_DEFAULT);
        });

        Collection::query()->select('id')->chunkById(50, function (EloquentCollection $collections) {
            dispatch(function () use ($collections) {
                $ids = $collections->pluck('id')->toArray();

                Collection::updateFiatValue($ids);

                Log::info('Updated Collection Fiat Value', [
                    'collections' => $ids,
                ]);
            })->onQueue(Queues::SCHEDULED_DEFAULT);
        });

        return Command::SUCCESS;
    }
}
