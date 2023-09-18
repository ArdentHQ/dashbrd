<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Gallery;
use App\Support\Queues;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class UpdateGalleriesValue extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'galleries:update-value';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Updates the gallery value based on the tokens price';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        dispatch(static function () {
            Gallery::updateValues();

            Log::info('Updated Gallery Value');
        })->onQueue(Queues::SCHEDULED_DEFAULT);

        return Command::SUCCESS;
    }
}
