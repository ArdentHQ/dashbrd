<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Jobs\Traits\WithWeb3DataProvider;
use App\Models\Network;
use App\Models\Wallet;
use Carbon\Carbon;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class FetchNativeBalances implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels, WithWeb3DataProvider;

    public function __construct(
        public Wallet $wallet,
        public Network $network,
    ) {
    }

    public function handle(): void
    {
        $nativeToken = $this->network->nativeToken()->firstOrFail();

        $provider = $this->getWeb3DataProvider();
        $balance = $provider->getNativeBalance($this->wallet, $this->network);

        DB::transaction(function () use ($balance, $nativeToken) {
            DB::table('balances')->upsert([
                'wallet_id' => $this->wallet->id,
                'token_id' => $nativeToken->id,
                'balance' => $balance,
                'created_at' => now(),
                'updated_at' => now(),
            ], ['wallet_id', 'token_id'], ['balance', 'updated_at']);
        });

        $this->wallet->extra_attributes->set('native_balances_fetched_at', Carbon::now());
        $this->wallet->save();
    }

    public function uniqueId(): string
    {
        return self::class.':'.$this->wallet->id.':'.$this->network->chain_id;
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
}
