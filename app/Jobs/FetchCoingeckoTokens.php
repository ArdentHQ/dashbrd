<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Services\MarketData\Providers\CoingeckoProvider;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class FetchCoingeckoTokens implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $provider = new CoingeckoProvider();
        $tokenList = $provider->fetchTokens();

        $dataToInsert = [];

        foreach ($tokenList as $token) {
            $dataToInsert[] = [
                'symbol' => $token['symbol'],
                'name' => $token['name'],
                'coingecko_id' => $token['id'],
                'platforms' => $token['platforms'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::transaction(static function () use ($dataToInsert) {
            DB::table('coingecko_tokens')->upsert(
                $dataToInsert,
                ['coingecko_id'],
                ['symbol', 'name', 'updated_at', 'platforms']
            );
        });

    }
}
