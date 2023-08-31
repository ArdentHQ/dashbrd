<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Data\NetworkData;
use App\Data\Wallet\WalletData;
use App\Jobs\FetchWalletNfts as FetchWalletNftsJob;
use App\Models\Network;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;

class FetchWalletNfts extends Command
{
    use InteractsWithNetworks;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wallets:fetch-nfts {--wallet-id=} {--chain-id=} {--cursor=} {--start-timestamp=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch nfts for the recently active wallets';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $networks = $this->networks();
        $walletId = $this->option('wallet-id');

        if ($walletId !== null) {
            $wallet = Wallet::findOrFail($walletId);

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
        Wallet::recentlyActive()->chunkById(100, function ($wallets) use ($networks) {
            $wallets->each(fn ($wallet) => $this->handleWallet($wallet, $networks));
        });
    }

    /**
     * @param  Collection<int, Network>  $networks
     */
    private function handleWallet(Wallet $wallet, Collection $networks): void
    {
        $startTimestamp = $this->option('start-timestamp');

        $networks->each(fn ($network) => FetchWalletNftsJob::dispatch(
            WalletData::from($wallet),
            NetworkData::from($network),
            $this->option('cursor'),
            empty($startTimestamp) ? Carbon::now() : Carbon::createFromTimestampMs($startTimestamp),
        ));
    }
}
