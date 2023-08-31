<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Contracts\MarketDataProvider;
use App\Exceptions\UnsupportedCurrencyException;
use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Support\Currency;
use App\Support\Queues;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class VerifySupportedCurrencies implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, RecoversFromProviderErrors;

    public function __construct()
    {
        $this->onQueue(Queues::SCHEDULED_DEFAULT);
    }

    public function handle(MarketDataProvider $provider): void
    {
        $providerCurrencies = $provider->getCurrencies();

        $diff = Currency::all()->pluck('code')->diff($providerCurrencies);

        if ($diff->isNotEmpty()) {
            throw new UnsupportedCurrencyException('There are some unsupported currencies that are not available on market data provider: '.$diff->join(', '));
        }
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(30);
    }

    public function uniqueId(): string
    {
        return self::class;
    }
}
