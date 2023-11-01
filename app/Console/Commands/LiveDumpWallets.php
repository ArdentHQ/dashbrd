<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Contracts\Web3DataProvider;
use App\Data\Web3\Web3NftData;
use App\Enums\Chain;
use App\Models\Network;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Web3\Alchemy\AlchemyWeb3DataProvider;
use App\Services\Web3\Moralis\MoralisWeb3DataProvider;
use App\Support\Facades\Mnemonic;
use Carbon\Carbon;
use Database\Seeders\NetworkSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LiveDumpWallets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wallets:live-dump';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a fixture dump using live state';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        Artisan::call('db:seed', ['--class' => NetworkSeeder::class, '--no-interaction' => true]);

        $providers = [new AlchemyWeb3DataProvider(), new MoralisWeb3DataProvider()];

        $chains = [Chain::ETH, Chain::Polygon];

        /** @var string[] */
        $addresses = config('dashbrd.live_dump_wallets');
        $addresses = collect($addresses)->map(static fn ($address) => Str::lower(trim($address)))->toArray();

        $progressBar = $this->output->createProgressBar((count($addresses) * count($providers) * count($chains)) + 1);

        $fs = Storage::disk('live-dump');

        $nftCollections = collect($chains)->mapWithKeys(fn ($chain) => [$chain->value => collect()]);

        foreach ($addresses as $address) {
            foreach ($chains as $chain) {
                foreach ($providers as $provider) {
                    $providerName = get_class($provider);
                    $providerSlug = Str::lower(Str::remove('Web3DataProvider', Str::afterLast($providerName, '\\')));

                    $user = User::whereHas('wallet', static fn ($query) => $query->where('address', $address))
                        ->first() ?? User::factory()->create();

                    $network = Network::firstWhere('chain_id', $chain->value);

                    $wallet = Wallet::findByAddress($address) ?? Wallet::factory()->create([
                        'user_id' => $user,
                        'address' => $address,
                    ]);

                    $nfts = $this->getWalletNfts($wallet, $network, $provider);

                    $collectionAddresses = $nfts
                        ->pluck('tokenAddress')
                        ->unique();

                    $nftCollections[$chain->value] = $nftCollections[$chain->value]->merge($collectionAddresses);

                    $collectionFloorPrices = $collectionAddresses
                        ->mapWithKeys(fn (string $collectionAddress
                        ) => [$collectionAddress => Mnemonic::getNftCollectionFloorPrice($chain, $collectionAddress)]);

                    // modify `network` and `retrievedAt` to make output stable between reruns as these change independent
                    // of the API response.
                    // The live dump seeder will replace the network with the correct id again.
                    $nfts->map(function ($nft) use ($collectionFloorPrices) {
                        $nft->networkId = 0;

                        $nft->floorPrice = $collectionFloorPrices->get($nft->tokenAddress);

                        if ($nft->floorPrice !== null) {
                            /** @var Carbon $date */
                            $date = Carbon::create(2023);
                            $nft->floorPrice->retrievedAt = $date;
                        }

                        return $nft;
                    });

                    $fileName = $providerSlug.'_'.Str::lower($chain->name).'_nfts_'.$address.'.json';
                    $fs->put($fileName, (string) json_encode($nfts, JSON_PRETTY_PRINT));

                    $progressBar->advance();
                }
            }
        }

        // Download traits for each collection
        $allTraits = $nftCollections->mapWithKeys(function ($collectionAddresses, $chainId) {
            $traits = $collectionAddresses->unique()
                ->mapWithKeys(fn ($collectionAddress) => [$collectionAddress => Mnemonic::getNftCollectionTraits(Chain::from($chainId), $collectionAddress)]);

            return [$chainId => $traits];
        });

        $fs->put('mnemonic_nft_collection_traits.json', (string) json_encode($allTraits, JSON_PRETTY_PRINT));
        $progressBar->advance();

        $progressBar->finish();

        return Command::SUCCESS;
    }

    /**
     * @return Collection<int, Web3NftData>
     */
    private function getWalletNfts(Wallet $wallet, Network $network, Web3DataProvider $provider): Collection
    {
        $cursor = null;

        $nfts = collect();

        do {
            $result = $provider->getWalletNfts($wallet, $network, $cursor);

            $cursor = $result->nextToken;

            $nfts = $nfts->concat($result->nfts->values());
        } while ($cursor !== null);

        return $nfts;
    }
}
