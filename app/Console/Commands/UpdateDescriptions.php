<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\UpdateNftDescription;
use App\Models\Network;
use Illuminate\Console\Command;

class UpdateDescriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nfts:update-descriptions {--start=} {--network=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch a job to update descriptions for NFTs';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $network = Network::find((int) $this->option('network'));

        if (! $network) {
            $this->warn('Network does not exist.');

            return 0;
        }

        UpdateNftDescription::dispatch((int) $this->option('start'), $network);

        return 0;
    }
}
