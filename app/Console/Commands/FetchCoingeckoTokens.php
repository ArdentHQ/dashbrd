<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCoingeckoTokens as FetchCoingeckoTokensJob;
use Illuminate\Console\Command;

class FetchCoingeckoTokens extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tokens:fetch-coingecko-tokens';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the complete token list from Coingecko';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        FetchCoingeckoTokensJob::dispatch();

        return Command::SUCCESS;
    }
}
