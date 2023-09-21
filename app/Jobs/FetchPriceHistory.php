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
use Illuminate\Support\Facades\Log;

class FetchPriceHistory implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

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
        Log::info('FetchPriceHistory Job: Processing', [
            'token_id' => $this->token->id,
            'token_name' => $this->token->name,
            'period' => $this->period->value,
            'currency' => $this->currency,
        ]);

        if (is_null($this->token->tokenGuid)) {
            Log::info('FetchPriceHistory Job: Ignored for token without guid', [
                'token_id' => $this->token->id,
                'token_name' => $this->token->name,
                'token_address' => $this->token->address,
                'token_network' => $this->token->network_id,
            ]);

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

        $affected = TokenPriceHistory::query()->insertOrIgnore($priceHistoryList);

        Log::info('FetchPriceHistory Job: Handled', [
            'token_id' => $this->token->id,
            'token_name' => $this->token->name,
            'affected' => $affected,
            'period' => $this->period->value,
            'currency' => $this->currency,
        ]);
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
