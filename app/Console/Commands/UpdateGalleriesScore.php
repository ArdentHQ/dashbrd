<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Gallery;
use App\Support\Queues;
use Illuminate\Console\Command;

class UpdateGalleriesScore extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'galleries:update-score';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Updates the gallery score based on the views and likes';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        dispatch(static function () {
            Gallery::updateScores();
        })->onQueue(Queues::SCHEDULED_DEFAULT);

        return Command::SUCCESS;
    }
}
