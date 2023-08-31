<?php

declare(strict_types=1);

namespace App\Services\Web3\Alchemy;

use App\Data\NetworkData;
use App\Data\Wallet\WalletData;
use App\Data\Web3\Web3Erc20TokenData;
use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Data\Web3\Web3NftsChunk;
use App\Enums\Chains;
use App\Exceptions\NotImplementedException;
use App\Models\Collection as CollectionModel;
use App\Models\Network;
use App\Models\Wallet;
use App\Services\Traits\LoadsFromCache;
use App\Services\Web3\AbstractWeb3DataProvider;
use App\Support\Facades\Alchemy;
use Carbon\Carbon;
use Illuminate\Support\Collection;

final class AlchemyWeb3DataProvider extends AbstractWeb3DataProvider
{
    use LoadsFromCache;

    /**
     * @return Collection<int, Web3Erc20TokenData>
     */
    public function getWalletTokens(WalletData $wallet, NetworkData $network): Collection
    {
        return Alchemy::erc20($wallet, $network);
    }

    public function getWalletNfts(
        WalletData $wallet,
        NetworkData $network,
        string $cursor = null,
        int $limit = null,
    ): Web3NftsChunk {
        return Alchemy::walletNfts($wallet, $network, $cursor, $limit);
    }

    public function getCollectionsNfts(
        CollectionModel $collection,
        string $startToken = null,
        int $limit = null
    ): Web3NftsChunk {
        return Alchemy::collectionNfts($collection, $startToken, $limit);
    }

    public function getEnsDomain(Wallet $wallet): ?string
    {
        throw new NotImplementedException();
    }

    public function getNativeBalance(Wallet $wallet, Network $network): string
    {
        return Alchemy::getNativeBalance($wallet, $network);
    }

    public function getBlockTimestamp(Network $network, int $blockNumber): Carbon
    {
        return $this->fromCache(
            static fn () => Alchemy::getBlockTimestamp($network, $blockNumber),
            [(string) $network->id, (string) $blockNumber]
        );
    }

    /**
     * Get the middleware to be used for jobs.
     *
     * @return array<int, object>
     */
    public function getMiddleware(): array
    {
        return [];
    }

    public function getNftCollectionFloorPrice(Chains $chain, string $contractAddress): ?Web3NftCollectionFloorPrice
    {
        return $this->fromCache(
            static fn () => Alchemy::getNftCollectionFloorPrice($chain, $contractAddress),
            [$chain->name, $contractAddress]
        );
    }
}
