<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Token;
use App\Models\TokenPriceHistory;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class TokenPriceHistorySeeder extends Seeder
{
    public function run(): void
    {
        $data = json_decode(file_get_contents(database_path('seeders/fixtures/live-dump/token_price_history.json')), true);

        $tokensBySymbol = Token::all()->groupBy('symbol');

        $flush = function (Collection $batch) {
            TokenPriceHistory::query()->insertOrIgnore($batch->toArray());
        };

        $batch = collect();
        $maxBatchSize = 5000;

        foreach ($data as $pricePoint) {
            // Take tokens across different networks into account
            $tokens = $tokensBySymbol->get($pricePoint['symbol'], []);

            foreach ($tokens as $token) {
                $guid = $token->tokenGuid->guid;
                assert(! is_null($guid));

                $batch->push([
                    'token_guid' => $token->tokenGuid->guid,
                    'price' => $pricePoint['price'],
                    'currency' => Str::lower($pricePoint['currency']),
                    'timestamp' => Carbon::createFromTimestampMs($pricePoint['timestamp']),
                ]);

                if ($batch->count() >= $maxBatchSize) {
                    $flush($batch);
                    $batch = collect();
                }
            }
        }

        $flush($batch);
    }
}
