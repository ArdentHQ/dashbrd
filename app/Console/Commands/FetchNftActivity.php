<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchNftActivity as Job;
use App\Models\Nft;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FetchNftActivity extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nfts:fetch-activity {--nft-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch activity for all NFTs or a specific NFT';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $nftId = $this->option('nft-id');

        if ($nftId !== null) {
            $nft = Nft::findOrFail($nftId);

            Log::info('Dispatching FetchNftActivity Job', [
                'nft' => $nft->id,
            ]);

            $this->handleNft($nft);
        } else {
            $this->handleOwnedNfts();
        }

        return Command::SUCCESS;
    }

    // @TODO enable this line once scalability issue of all NFT activities handled
    //    private function handleAllNfts(): void
    //    {
    //        Nft::latest()
    //            ->chunk(100, function ($nfts) {
    //                $nfts->each(fn ($nft) => $this->handleNft($nft));
    //            });
    //    }

    private function handleOwnedNfts(): void
    {
        Nft::query()
            ->whereNotNull('wallet_id')
            ->chunkById(100, function ($nfts) {
                Log::info('Dispatching FetchNftActivity Job', [
                    'nfts' => $nfts->pluck('id')->toArray(),
                ]);

                $nfts->each(fn ($nft) => $this->handleNft($nft));
            });
    }

    private function handleNft(Nft $nft): void
    {
        Job::dispatch($nft);
    }
}
