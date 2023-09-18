<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchUserNfts;
use App\Models\Gallery;
use App\Models\Network;
use App\Models\Wallet;
use App\Support\Queues;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class MaintainGalleries extends Command
{
    use InteractsWithNetworks;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wallets:maintain-galleries {--user-id=} {--chain-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Maintain galleries of all users';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $networks = $this->networks();
        $userId = $this->option('user-id');

        if ($userId !== null) {
            $gallery = Gallery::where('user_id', $userId)->firstOrFail();

            Log::info('Dispatching MaintainGalleries Job', [
                'user_id' => $userId,
                'networks' => $networks->pluck('id')->toArray(),
            ]);

            $this->handleUser($gallery['user_id'], $networks);
        } else {
            $wallets = Wallet::notRecentlyActive()->whereHas('user', function ($query) {
                return $query->whereHas('galleries');
            });

            Log::info('Dispatching MaintainGalleries Job', [
                'user_ids' => $wallets->pluck('user_id')->toArray(),
                'networks' => $networks->pluck('id')->toArray(),
            ]);

            $wallets->chunk(
                100,
                fn ($chunk) => $chunk
                    ->each(fn ($wallet) => $this->handleUser($wallet->user_id, $networks))
            );
        }
    }

    /**
     * @param  Collection<int, Network>  $networks
     */
    private function handleUser(int $userId, Collection $networks): void
    {
        $networks->each(function ($network) use ($userId) {
            FetchUserNfts::dispatch($userId, $network)->onQueue(Queues::SCHEDULED_WALLET_NFTS);
        });
    }
}
