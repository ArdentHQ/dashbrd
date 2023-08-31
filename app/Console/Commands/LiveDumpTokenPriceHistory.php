<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Models\Token;
use App\Services\MarketData\Providers\CoingeckoProvider;
use Database\Seeders\CoingeckoTokenSeeder;
use Database\Seeders\NetworkSeeder;
use Database\Seeders\TokenSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

class LiveDumpTokenPriceHistory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tokens:live-dump-price-history';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a fixture dump using live state';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        Artisan::call('db:wipe');
        Artisan::call('migrate:fresh');
        collect([NetworkSeeder::class, CoingeckoTokenSeeder::class, TokenSeeder::class])
            ->each(fn ($class) => Artisan::call('db:seed', ['--class' => $class, '--no-interaction' => true]));

        $provider = new CoingeckoProvider();

        $fs = Storage::disk('live-dump');
        $fileName = 'token_price_history.json';

        // Only dump prices for MATIC, ETH for now, extend as needed.
        $tokens = Token::all()->whereIn('symbol', ['MATIC', 'ETH'])->unique('symbol');
        // Consider dumping all currencies, Extend as needed.
        $currencyCodes = [CurrencyCode::USD, CurrencyCode::EUR, CurrencyCode::GBP];

        $rows = collect();

        foreach ($tokens as $token) {
            foreach ($currencyCodes as $currencyCode) {
                $priceHistory = $provider->getPriceHistory($token, $currencyCode, Period::YEARS_15);

                $rows = $rows->concat($priceHistory->toCollection()->map(function ($pricePoint) use ($token, $currencyCode) {
                    return [
                        'symbol' => $token['symbol'],
                        'timestamp' => $pricePoint->timestamp,
                        'price' => $pricePoint->price,
                        'currency' => $currencyCode->value,
                    ];
                }));
            }
        }

        $rows = Arr::sort($rows->toArray(), function ($row) {
            return $row['symbol'].'_'.$row['timestamp'];
        });

        $fs->put($fileName, (string) json_encode(array_values($rows), JSON_PRETTY_PRINT));

        return Command::SUCCESS;
    }
}
