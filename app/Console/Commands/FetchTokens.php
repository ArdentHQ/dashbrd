<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchTokens as Job;
use App\Models\Network;
use App\Models\Wallet;
use App\Support\Queues;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class FetchTokens extends Command
{
    use InteractsWithNetworks;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wallets:fetch-tokens {--wallet-id=} {--chain-id=} {--only-online}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch tokens for the recently active wallets';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $networks = $this->networks();

        $walletId = $this->option('wallet-id');

        if ($walletId !== null) {
            $wallet = Wallet::findOrFail($walletId);

            Log::info('Dispatching FetchTokens Job', [
                'wallet' => $wallet->address,
                'networks' => $networks->pluck('id')->toArray(),
            ]);

            $this->handleWallet($wallet, $networks);
        } else {
            $this->handleAllWallets($networks);
        }

        return Command::SUCCESS;
    }

    /**
     * @param  Collection<int, Network>  $networks
     */
    private function handleAllWallets(Collection $networks): void
    {
        $onlyOnline = $this->option('only-online');

        Wallet::query()
            ->when($onlyOnline, fn ($query) => $query->online())
            ->when(! $onlyOnline, fn ($query) => $query->recentlyActive())
            ->chunkById(100, function ($wallets) use ($networks) {
                $wallets->each(fn ($wallet) => $this->handleWallet($wallet, $networks));

                Log::info('Dispatching FetchTokens Job', [
                    'wallets' => $wallets->pluck('address')->toArray(),
                    'networks' => $networks->pluck('id')->toArray(),
                ]);
            });
    }

    /**
     * @param  Collection<int, Network>  $networks
     */
    private function handleWallet(Wallet $wallet, Collection $networks): void
    {
        $networks->each(fn ($network) => Job::dispatch($wallet, $network)->onQueue(Queues::TOKENS));
    }
}
