<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchNativeBalances as FetchNativeBalancesJob;
use App\Models\Network;
use App\Models\Wallet;
use App\Support\Queues;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;

class FetchNativeBalances extends Command
{
    use InteractsWithNetworks;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wallets:fetch-native-balances {--wallet-id=} {--chain-id=} {--only-online}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch native balances for the recently active wallets';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $networks = $this->networks();
        $walletId = $this->option('wallet-id');

        if ($walletId !== null) {
            $wallet = Wallet::findOrFail($walletId);

            $this->process($networks, $wallet);
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
            ->select(['id', 'address'])
            ->when($onlyOnline, fn ($query) => $query->online())
            ->when(! $onlyOnline, fn ($query) => $query->recentlyActive())
            ->chunkById(100, function ($wallets) use ($networks) {
                $this->process($networks, ...$wallets);
            });
    }

    /**
     * @param  Collection<int, Network>  $networks
     */
    private function process(Collection $networks, Wallet ...$wallets): void
    {
        $networks
            ->each(fn ($network) => FetchNativeBalancesJob::dispatch(collect($wallets), $network)
            ->onQueue(Queues::WALLETS));
    }
}
