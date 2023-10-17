<?php

declare(strict_types=1);

namespace App\Services\Web3\Fake;

use App\Data\Web3\Web3Erc20TokenData;
use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Data\Web3\Web3NftData;
use App\Data\Web3\Web3NftsChunk;
use App\Enums\Chains;
use App\Exceptions\NotImplementedException;
use App\Models\Collection as CollectionModel;
use App\Models\Network;
use App\Models\Nft;
use App\Models\Token;
use App\Models\Wallet;
use App\Services\Traits\LoadsFromCache;
use App\Services\Web3\AbstractWeb3DataProvider;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

final class FakeWeb3DataProvider extends AbstractWeb3DataProvider
{
    use LoadsFromCache;
    use WithFaker;

    public function __construct()
    {
        $this->setUpFaker();
    }

    /**
     * @return Collection<int, Web3Erc20TokenData>
     */
    public function getWalletTokens(Wallet $wallet, Network $network): Collection
    {
        $tokens = Token::where('network_id', $network->id)->get();

        return $tokens->map(static function ($token) use ($wallet, $network) {
            $minBalance = (int) 1e17;
            $maxBalance = (int) 1e18;
            $balance = random_int($minBalance, $maxBalance);

            return new Web3Erc20TokenData(
                $token->address,
                $network->id,
                $wallet->address,
                $token->name,
                $token->symbol,
                $token->decimals,
                null,
                null,
                strval($balance),
            );
        });
    }

    public function getWalletNfts(Wallet $wallet, Network $network, string $cursor = null): Web3NftsChunk
    {
        $nfts = Nft::with('collection')
            ->whereHas('collection', static fn ($query) => $query->where('network_id', $network->id))
            ->get();

        $nfts = $nfts->map(function ($nft) use ($wallet, $network) {
            return new Web3NftData(
                tokenAddress: $nft->collection->address,
                tokenNumber: $nft->token_number,
                networkId: $network->id,
                collectionName: $nft->collection->name,
                collectionSymbol: $nft->collection->symbol,
                collectionImage: $nft->collection->image(),
                collectionWebsite: $nft->collection->website(),
                collectionDescription: null,
                collectionSocials: null,
                collectionSupply: null,
                collectionBannerImageUrl: null,
                collectionBannerUpdatedAt: null,
                collectionOpenSeaSlug: null,
                name: $nft->name,
                description: null,
                extraAttributes: $nft['extra_attributes']->toArray(),
                floorPrice: $this->getNftCollectionFloorPrice(Chains::ETH, $wallet->address),
                traits: [],
                mintedBlock: random_int(1, 10000),
                mintedAt: now(),
                hasError: false,
                error: null,
            );
        });

        return new Web3NftsChunk(
            nfts: $nfts,
            nextToken: null,
        );
    }

    public function getEnsDomain(Wallet $wallet): ?string
    {
        return Cache::rememberForever('fake-wallet-ens-'.$wallet->address, function () {
            return $this->faker()->optional()->domainName;
        });
    }

    public function getNativeBalance(Wallet $wallet, Network $network): string
    {
        return (string) (random_int(50, 1000) * 1e18);
    }

    public function getBlockTimestamp(Network $network, int $blockNumber): Carbon
    {
        return now();
    }

    public function getNftCollectionFloorPrice(Chains $chain, string $contractAddress): ?Web3NftCollectionFloorPrice
    {
        return new Web3NftCollectionFloorPrice((string) (random_int(50, 1000) * 1e18), 'eth', Carbon::now());
    }

    public function getCollectionsNfts(CollectionModel $collection, ?string $startToken): Web3NftsChunk
    {
        throw new NotImplementedException();
    }

    public function getMiddleware(): array
    {
        return [];
    }
}
