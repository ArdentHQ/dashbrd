<?php

declare(strict_types=1);

namespace App\Console\Commands\MarketData;

use App\Console\Commands\DependsOnCoingeckoRateLimit;
use App\Jobs\VerifySupportedCurrencies as Job;
use Illuminate\Console\Command;

class VerifySupportedCurrencies extends Command
{
    use DependsOnCoingeckoRateLimit;

    protected $signature = 'marketdata:verify-supported-currencies';

    protected $description = 'Verify that all currencies supported in Dashbrd are also available on the market data provider';

    public function handle(): void
    {
        $this->dispatchDelayed(
            callback: fn () => Job::dispatch(),
            index: 0,
            job: Job::class,
        );
    }
}
