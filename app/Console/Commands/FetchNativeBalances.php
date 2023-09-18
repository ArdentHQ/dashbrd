<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchNativeBalances as FetchNativeBalancesJob;
use App\Models\Network;
use App\Models\Wallet;
use App\Support\Queues;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Facades\Log;

class FetchNativeBalances extends Command
{
    use InteractsWithNetworks;

    /**
     * Moralis API supports up to 25 addresses
     *
     * @see https://docs.moralis.io/web3-data-api/evm/reference/get-native-balances-for-addresses?chain=eth&wallet_addresses=[]
     */
    const CHUNK_SIZE = 25;

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

            Log::info('Dispatching FetchNativeBalances Job', [
                'wallet' => $wallet->address,
            ]);

            $this->process(collect([$wallet]), $networks);
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
            ->chunkById(self::CHUNK_SIZE, function ($wallets) use ($networks) {
                Log::info('Dispatching FetchNativeBalances Job', [
                    'wallets' => $wallets->pluck('address')->toArray(),
                ]);

                $this->process($wallets, $networks);
            });
    }

    /**
     * @param  Collection<int, Network>  $networks
     * @param  SupportCollection<int, Wallet>  $wallets
     */
    private function process(SupportCollection $wallets, Collection $networks): void
    {
        $networks
            ->each(fn ($network) => FetchNativeBalancesJob::dispatch($wallets, $network)
            ->onQueue(Queues::WALLETS));
    }
}
