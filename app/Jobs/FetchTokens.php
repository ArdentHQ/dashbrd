<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Jobs\Traits\WithWeb3DataProvider;
use App\Models\Balance;
use App\Models\Network;
use App\Models\Token;
use App\Models\Wallet;
use Carbon\Carbon;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FetchTokens implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels, WithWeb3DataProvider;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Wallet $wallet,
        public Network $network,
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('FetchTokens Job: Processing', [
            'wallet' => $this->wallet->address,
            'network' => $this->network->id,
        ]);

        $web3DataProvider = $this->getWeb3DataProvider();

        $tokens = $web3DataProvider->getWalletTokens($this->wallet, $this->network);

        $params = $tokens->map(static function ($token) {
            return [
                'address' => $token->tokenAddress,
                'network_id' => $token->networkId,
                'name' => $token->name,
                'symbol' => $token->symbol,
                'decimals' => $token->decimals ?? 0,
            ];
        });

        $tokens = DB::transaction(function () use ($tokens, $params) {
            $dbTokens = Collection::make($params->map(fn ($record) => Token::updateOrCreate([
                'address' => $record['address'],
                'network_id' => $record['network_id'],
            ], $record)));

            $groupedByAddress = collect($dbTokens)->groupBy('address');

            Balance::upsert(
                $tokens
                    ->filter(fn ($token) => ! is_null($token->balance))
                    ->map(fn ($token) => [
                        'wallet_id' => $this->wallet->id,
                        'token_id' => $groupedByAddress->get($token->tokenAddress)->first()->id,
                        'balance' => $token->balance ?? 0,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ])
                    ->toArray(),
                ['wallet_id', 'token_id']
            );

            return $dbTokens;
        });

        // Delete balances that are not in the list of tokens and are not native
        // tokens (which are handled on the `FetchNativeTokens` job)
        $deleted = $this->wallet->balances()
            ->whereHas('token', fn ($query) => $query
                    ->where('network_id', $this->network->id)
                    ->whereNotIn('id', $tokens->pluck('id'))
            )
            // Dont delete balances for test tokens
            ->when(! App::environment('production'), fn ($query) => $query->whereDoesntHave('token', fn ($query) => $query->whereIn('symbol', config('dashbrd.test_tokens'))))
            ->whereDoesntHave('token', fn ($query) => $query->nativeToken())
            ->delete();

        $this->wallet->extra_attributes->set('tokens_fetched_at', Carbon::now());
        $this->wallet->save();

        Log::info('FetchTokens Job: Handled', [
            'tokens' => $tokens->pluck('id')->toArray(),
            'wallet' => $this->wallet->address,
            'network' => $this->network->id,
            'deleted_balances_count' => $deleted,
        ]);
    }

    public function uniqueId(): string
    {
        return self::class.':'.$this->wallet->id.':'.$this->network->chain_id;
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(15);
    }
}
