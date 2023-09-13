<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Jobs\Traits\WithWeb3DataProvider;
use App\Models\Balance;
use App\Models\Network;
use App\Support\Facades\Moralis;
use Carbon\Carbon;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class FetchNativeBalances implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels, WithWeb3DataProvider;

    public function __construct(
        public Collection $wallets,
        public Network $network,
    ) {
    }

    public function handle(): void
    {
        $nativeToken = $this->network->nativeToken()->firstOrFail();

        $addresses = $this->wallets->pluck('address')->toArray();

        $balances = Moralis::getNativeBalances($addresses, $this->network);

        $walletsToUpdate = collect();

        $balancesToInsert = $balances->map(function ($walletBalance) use ($nativeToken, $walletsToUpdate) {
            $wallet = $this->wallets->first(fn ($wallet) => $wallet->address === $walletBalance->address);

            $walletsToUpdate->push($wallet);

            return [
                'wallet_id' => $wallet->id,
                'token_id' => $nativeToken->id,
                'balance' => $walletBalance->balance,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        });

        DB::transaction(function () use ($balancesToInsert) {
            Balance::query()->upsert([$balancesToInsert], ['wallet_id', 'token_id'], ['balance', 'updated_at']);
        });

        $walletsToUpdate->each(function ($wallet) {
            $wallet->extra_attributes->set('native_balances_fetched_at', Carbon::now());
            $wallet->save();
        });
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
