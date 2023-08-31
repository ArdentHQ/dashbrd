<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Collection;
use App\Models\User;
use App\Support\Queues;
use Illuminate\Console\Command;

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
        dispatch(static function () {
            Collection::updateFiatValue();
            User::updateCollectionsValue();
        })->onQueue(Queues::SCHEDULED_DEFAULT);

        return Command::SUCCESS;
    }
}
