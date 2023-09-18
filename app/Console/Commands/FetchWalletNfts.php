<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchWalletNfts as FetchWalletNftsJob;
use App\Models\Network;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

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
        $startTimestamp = $this->option('start-timestamp');

        $networks = $this->networks();
        $walletId = $this->option('wallet-id');
        $cursor = $this->option('cursor');
        $startTimestamp = empty($startTimestamp) ? Carbon::now() : Carbon::createFromTimestampMs($startTimestamp);

        if ($walletId !== null) {
            $wallet = Wallet::findOrFail($walletId);

            Log::info('Dispatching FetchWalletNfts Job', [
                'wallets' => $wallet->address,
                'networks' => $networks->pluck('id')->toArray(),
                'cursor' => $cursor,
                'start-timestamp' => $startTimestamp?->toDateTimeString(),
            ]);

            $this->handleWallet($wallet, $networks, $cursor, $startTimestamp);
        } else {
            $this->handleAllWallets($networks, $cursor, $startTimestamp);
        }

        return Command::SUCCESS;
    }

    /**
     * @param  Collection<int, Network>  $networks
     */
    private function handleAllWallets(Collection $networks, ?string $cursor, ?Carbon $startTimestamp): void
    {
        Wallet::recentlyActive()->chunkById(100, function ($wallets) use ($networks, $cursor, $startTimestamp) {
            Log::info('Dispatching FetchWalletNfts Job', [
                'wallets' => $wallets->pluck('address')->toArray(),
                'networks' => $networks->pluck('id')->toArray(),
                'cursor' => $cursor,
                'start-timestamp' => $startTimestamp?->toDateTimeString(),
            ]);

            $wallets->each(fn ($wallet) => $this->handleWallet($wallet, $networks, $cursor, $startTimestamp));
        });
    }

    /**
     * @param  Collection<int, Network>  $networks
     */
    private function handleWallet(Wallet $wallet, Collection $networks, ?string $cursor, ?Carbon $startTimestamp): void
    {
        $networks->each(fn ($network) => FetchWalletNftsJob::dispatch(
            wallet: $wallet,
            network: $network,
            cursor: $cursor,
            startTimestamp: $startTimestamp,
        ));
    }
}
