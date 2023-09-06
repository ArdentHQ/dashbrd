<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Contracts\MarketDataProvider;
use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Token;
use App\Models\TokenGuid;
use App\Support\Queues;
use Carbon\Carbon;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateTokenDetails implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, RecoversFromProviderErrors;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private Token $token
    ) {
        $this->onQueue(Queues::TOKENS);
    }

    /**
     * Execute the job.
     */
    public function handle(MarketDataProvider $provider): void
    {
        $tokenDetails = $provider->getTokenDetails($this->token);

        if ($tokenDetails === null) {
            // We can later adjust this to make use of Sentry as well, once we know more about the rate at which this gets triggered
            Log::debug('Missing data for token '.$this->token->name.' (ID: '.$this->token->id.')');

            return;
        }

        DB::transaction(function () use ($tokenDetails) {
            $this->token->setTokenDetails($tokenDetails);

            $guid = TokenGuid::firstOrCreate([
                'guid' => $tokenDetails['guid'],
                'address' => $this->token['address'],
                'network_id' => $this->token['network_id'],
            ]);

            $this->token->tokenGuid()->associate($guid);
            $this->token->save();

            /** @var array<string, float> $prices */
            $prices = Arr::get($tokenDetails, 'market_data.current_prices', []);
            /** @var array<string, float> $priceChanges24h */
            $priceChanges24h = Arr::get($tokenDetails, 'market_data.price_change_24h_in_currency', []);

            DB::table('token_prices')->upsert(collect($prices)->map(function ($price, $currency) use ($guid, $priceChanges24h) {
                $priceChange24hInCurrency = $priceChanges24h[$currency] ?? 0;
                $priceChangePercent = 0;

                $diff = $price - $priceChange24hInCurrency;
                if (abs($diff) > PHP_FLOAT_EPSILON) {
                    $priceChangePercent = 100 * ($price / $diff - 1);
                }

                return [
                    'token_guid' => $guid->id,
                    'currency' => $currency,
                    'price' => $price,
                    'price_change_24h' => $priceChangePercent,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ];
            })->all(), ['token_guid', 'currency'], ['price', 'price_change_24h', 'updated_at']);
        });
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(20);
    }

    public function uniqueId(): string
    {
        return self::class.':'.$this->token->id;
    }
}
