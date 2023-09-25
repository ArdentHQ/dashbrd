<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Data\Web3\Web3NftCollectionTrait;
use App\Data\Web3\Web3NftData;
use App\Enums\Chains;
use App\Enums\Features;
use App\Enums\TraitDisplayType;
use App\Exceptions\NotImplementedException;
use App\Models\Gallery;
use App\Models\Network;
use App\Models\User;
use App\Models\Wallet;
use App\Rules\WalletAddress;
use App\Services\Web3\Alchemy\AlchemyWeb3DataProvider;
use App\Services\Web3\Moralis\MoralisWeb3DataProvider;
use App\Support\Web3NftCollectionHandler;
use App\Support\Web3NftHandler;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Laravel\Pennant\Feature;

class LiveUserSeeder extends UserSeeder
{
    public function run(): void
    {
        $this->ingestLiveDump();

        $user = $this->getLocalUser();

        if (Feature::active(Features::Galleries->value)) {
            $this->createUserGalleries($user);
        }
    }

    private function createUserGalleries(User $user): void
    {
        $gallery = Gallery::factory()->create([
            'user_id' => $user->id,
            'name' => fake()->name(),
            'slug' => fake()->slug(),
        ]);

        $user->wallets()->each(function ($wallet) use ($gallery) {
            $nfts = $wallet->fresh()
                ->nfts
                ->random(6)
                ->pluck('id');

            foreach ($nfts as $index => $nftId) {
                $gallery->nfts()->attach($nftId, ['order_index' => $index]);
            }
        });

        Gallery::updateValues([$gallery->id]);
    }

    private function ingestLiveDump(): void
    {
        $liveDumpPath = $this->getFixtureLiveDumpPath();
        $wantedProviderName = $this->getProviderName();

        $files = File::files($liveDumpPath);

        $traitsDump = 'mnemonic_nft_collection_traits.json';

        foreach ($files as $file) {
            if (! $file->isFile()) {
                continue;
            }

            // the wallet address and network are embedded into the file name:
            // alchemy_eth_nfts_0x0e82f52272def1ab77d87a3b1050168292e6e8a6.json
            $exploded = explode('_', $file->getFilename());
            if (count($exploded) != 4) {
                continue;
            }

            [$providerName, $networkName, $what, $addressPart] = $exploded;
            if ($providerName !== $wantedProviderName) {
                continue;
            }

            [$address] = explode('.json', $addressPart);
            if (! (new WalletAddress())->passes('', $address)) {
                continue;
            }

            $user = User::whereHas('wallet', static fn ($query) => $query->where('address', $address))
                ->first() ?? User::factory()->create();

            $chainId = collect(Chains::cases())->firstOrFail(fn ($case) => Str::lower($case->name) === Str::lower($networkName))->value;
            $networkId = Network::firstWhere('chain_id', $chainId)->id;

            Wallet::withoutEvents(function () use ($address, $networkId, $user, $what, $file) {
                $localTestingWallet = Wallet::where('address', getenv('LOCAL_TESTING_ADDRESS'))
                    ->firstOrFail();

                $wallet = Wallet::where('user_id', $user->id)
                    ->where('address', $address)
                    ->first()
                    ?? Wallet::factory()->create([
                        'user_id' => $user->id,
                        'address' => $address,
                    ]);

                $user->update([
                    'wallet_id' => $wallet->id,
                ]);

                switch ($what) {
                    case 'nfts':

                        (new Web3NftHandler(wallet: $localTestingWallet))
                            ->store($this->loadWalletNftsFixtures($file->getFilename(), $networkId));
                        break;

                    default:
                        throw new NotImplementedException();
                }
            });
        }

        $this->ingestCollectionTraitsFixtures($traitsDump);
    }

    /**
     * @return Collection<int, Web3NftData>
     */
    private function loadWalletNftsFixtures(string $fileName, int $networkId): Collection
    {
        $liveDumpFixturePath = $this->getFixtureLiveDumpPath();
        $filePath = $liveDumpFixturePath.DIRECTORY_SEPARATOR.$fileName;

        /** @var string $contents */
        $contents = file_get_contents($filePath);
        /** @var array<int, mixed> $array */
        $array = json_decode($contents, true);

        /** @var Collection<int, mixed> */
        return collect($array)->map(fn ($nft) => new Web3NftData(
            tokenAddress: $nft['tokenAddress'],
            tokenNumber: $nft['tokenNumber'],
            networkId: $networkId,
            collectionName: $nft['collectionName'],
            collectionSymbol: $nft['collectionSymbol'],
            collectionImage: $nft['collectionImage'],
            collectionWebsite: $nft['collectionWebsite'],
            collectionDescription: $nft['collectionDescription'],
            collectionSocials: $nft['collectionSocials'],
            collectionSupply: $nft['collectionSupply'],
            collectionBannerImageUrl: $nft['collectionBannerImageUrl'] ?? null,
            collectionBannerUpdatedAt: null,
            collectionOpenSeaSlug: $nft['collectionOpenSeaSlug'] ?? null,
            collectionOpenSeaSlugUpdatedAt: null,
            name: $nft['name'],
            description: $nft['description'],
            extraAttributes: $nft['extraAttributes'],
            floorPrice: $nft['floorPrice'] ? new Web3NftCollectionFloorPrice(
                $nft['floorPrice']['price'],
                $nft['floorPrice']['currency'],
                Carbon::parse($nft['floorPrice']['retrievedAt']),
            ) : null,
            traits: array_map(fn ($trait) => [
                'name' => $trait['name'],
                'value' => $trait['value'],
                'displayType' => TraitDisplayType::from($trait['displayType']),
            ], $nft['traits']),
            mintedAt: Carbon::parse($nft['mintedAt']),
            mintedBlock: $nft['mintedBlock'],
        ));
    }

    private function ingestCollectionTraitsFixtures(string $fileName): void
    {
        $liveDumpFixturePath = $this->getFixtureLiveDumpPath();
        $filePath = $liveDumpFixturePath.DIRECTORY_SEPARATOR.$fileName;

        /** @var string $contents */
        $contents = file_get_contents($filePath);
        /** @var array<int, mixed> $array */
        $array = json_decode($contents, true);

        $handler = new Web3NftCollectionHandler();
        collect($array)->each(function ($collections, $chainId) use ($handler) {
            /** @var array<int, mixed> $traits */
            collect($collections)->filter(fn ($traits) => ! collect($traits)->isEmpty())
                ->chunk(100)
                ->each(fn ($chunk) => $chunk->map(function ($traits, $collectionAddress) use ($handler, $chainId) {
                    $dbCollection = \App\Models\Collection::where('address', $collectionAddress)
                        ->whereHas('network', fn ($query) => $query->where('chain_id', $chainId))
                        ->first();

                    if ($dbCollection === null) {
                        // we restore NFTs either from Alchemy OR Moralis, while the traits dump contains a superset,
                        // so we simply ignore those that are missing since we do not care about them in the first place.
                        return;
                    }

                    $restored = collect($traits)->map(fn ($trait) => new Web3NftCollectionTrait(
                        name: $trait['name'],
                        value: $trait['value'],
                        valueMin: $trait['valueMin'] ?? 0,
                        valueMax: $trait['valueMax'] ?? 0,
                        nftsCount: $trait['nftsCount'],
                        nftsPercentage: $trait['nftsPercentage'],
                        displayType: TraitDisplayType::from($trait['displayType']),
                    ))->unique(fn ($trait) => '_'.$dbCollection->id.'_'.$trait->name.'_'.$trait->value);

                    $handler->storeTraits($dbCollection->id, $restored);
                }));
        });
    }

    private function getFixtureLiveDumpPath(): string
    {
        return database_path('seeders/fixtures/live-dump');
    }

    private function getProviderName(): string
    {
        $providerClass = config('dashbrd.default_data_provider');

        $providerName = match ($providerClass) {
            AlchemyWeb3DataProvider::class => 'alchemy',
            MoralisWeb3DataProvider::class => 'moralis',
            default => 'fallback', // happens for e.g. FakeProvider
        };

        // fallback to alchemy
        if ($providerName === 'fallback') {
            $providerName = 'alchemy';
        }

        return $providerName;
    }

    private function getLocalUser(): User
    {
        return User::whereHas('wallet', fn ($query) => $query->where('address', getenv('LOCAL_TESTING_ADDRESS')))
            ->firstOrFail();
    }
}
