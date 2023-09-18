<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchEnsDetails as Job;
use App\Models\Wallet;
use App\Support\Queues;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FetchEnsDetails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wallets:fetch-ens-details {--wallet-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch ENS details for the recently active wallets';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $walletId = $this->option('wallet-id');

        if ($walletId !== null) {
            $wallet = Wallet::findOrFail($walletId);

            Log::info('Dispatching FetchEnsDetails Job', [
                'wallet' => $wallet->address,
            ]);

            $this->handleWallet($wallet);
        } else {
            $this->handleAllWallets();
        }

        return Command::SUCCESS;
    }

    private function handleAllWallets(): void
    {
        Wallet::recentlyActive()->chunkById(100, function ($wallets) {
            Log::info('Dispatching FetchEnsDetails Job', [
                'wallets' => $wallets->pluck('address')->toArray(),
            ]);

            $wallets->each(fn ($wallet) => $this->handleWallet($wallet));
        });
    }

    private function handleWallet(Wallet $wallet): void
    {
        Job::dispatch($wallet)->onQueue(Queues::WALLETS);
    }
}
