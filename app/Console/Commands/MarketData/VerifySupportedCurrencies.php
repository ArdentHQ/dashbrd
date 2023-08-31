<?php

declare(strict_types=1);

namespace App\Console\Commands\MarketData;

use App\Jobs\VerifySupportedCurrencies as Job;
use Illuminate\Console\Command;

class VerifySupportedCurrencies extends Command
{
    protected $signature = 'marketdata:verify-supported-currencies';

    protected $description = 'Verify that all currencies supported in Dashbrd are also available on the market data provider';

    public function handle(): void
    {
        Job::dispatch();
    }
}
