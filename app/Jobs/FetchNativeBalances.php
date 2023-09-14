<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Jobs\Traits\WithWeb3DataProvider;
use App\Models\Balance;
use App\Models\Network;
use App\Models\Wallet;
use App\Support\Facades\Moralis;
use Carbon\Carbon;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FetchNativeBalances implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, WithWeb3DataProvider;

    /**
     * @param  Collection<int, Wallet> $wallets
     */
    public function __construct(
        public Collection $wallets,
        public Network $network,
    ) {
    }

    public function handle(): void
    {
        Log::info('Processing FetchNativeBalances job', [
            'network_id' => $this->network->id,
            'wallet_ids' => $this->wallets->pluck('id')->toArray(),
        ]);

        $nativeToken = $this->network->nativeToken()->firstOrFail();

        $addresses = $this->wallets->pluck('address')->toArray();

        $balances = Moralis::getNativeBalances($addresses, $this->network);

        $walletsToUpdate = collect();

        $balancesToInsert = $balances->map(function ($walletBalance) use ($nativeToken, $walletsToUpdate) {
            $address = Str::lower($walletBalance->address);

            $wallet = $this->wallets->first(fn ($wallet) => $address === Str::lower($wallet->address));

            $walletsToUpdate->push($wallet);

            return [
                'wallet_id' => $wallet->id,
                'token_id' => $nativeToken->id,
                'balance' => $walletBalance->balance,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        });

        if ($balancesToInsert->isEmpty()) {
            return;
        }

        Log::info('Updating native balances', [
            'network_id' => $this->network->id,
            'data' => $balancesToInsert->map(fn ($balance) => collect($balance)->only(['wallet_id', 'balance'])),
        ]);

        DB::transaction(function () use ($balancesToInsert) {
            Balance::query()->upsert(
                $balancesToInsert->toArray(),
                ['wallet_id', 'token_id'],
                ['balance', 'updated_at']
            );
        });

        $walletsToUpdate->map(function ($wallet) {
            $wallet->extra_attributes->set('native_balances_fetched_at', Carbon::now());
            $wallet->save();
        });

    }

    public function uniqueId(): string
    {
        $sortedWalletIds = [...$this->wallets->pluck('id')];
        sort($sortedWalletIds, SORT_NUMERIC);

        return self::class.':'.$this->network->chain_id.':'.implode('-', $sortedWalletIds);
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
}
