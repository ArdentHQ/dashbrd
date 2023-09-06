<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Contracts\MarketDataProvider;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Token;
use App\Models\TokenPriceHistory;
use Carbon\Carbon;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FetchPriceHistory implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, RecoversFromProviderErrors;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private Token $token,
        private Period $period,
        private string $currency
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(MarketDataProvider $provider): void
    {
        if (is_null($this->token->tokenGuid)) {
            return;
        }

        $priceHistory = $provider->getPriceHistory(
            token: $this->token,
            currency: CurrencyCode::from(strtoupper($this->currency)),
            period: $this->period
        );

        $priceHistoryList = array_map(function ($history) {
            return [
                'price' => $history['price'],
                'timestamp' => Carbon::createFromTimestampMs($history['timestamp']),
                'token_guid' => $this->token->tokenGuid->guid,
                'currency' => CurrencyCode::from(strtoupper($this->currency))->canonical(),
            ];
        }, $priceHistory->toArray());

        TokenPriceHistory::query()->insertOrIgnore($priceHistoryList);
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(15);
    }

    public function uniqueId(): string
    {
        return implode(':', [
            self::class,
            $this->currency,
            $this->token->tokenGuid?->guid,
            $this->period->value,
        ]);
    }
}
