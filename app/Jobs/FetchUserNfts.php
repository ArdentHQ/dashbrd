<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Network;
use App\Models\Wallet;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FetchUserNfts implements ShouldBeUnique, ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $userId,
        public Network $network
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $wallets = Wallet::where('user_id', $this->userId)->get();

        $wallets->each(fn ($wallet) => FetchWalletNfts::dispatch($wallet, $this->network)->onQueue($this->queue));
    }

    public function uniqueId(): string
    {
        return self::class.':'.$this->userId.':'.$this->network->chain_id;
    }
}
