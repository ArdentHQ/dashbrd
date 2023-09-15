<?php

declare(strict_types=1);

namespace App\Services\Web3\Moralis;

use App\Data\NetworkData;
use App\Data\Wallet\WalletData;
use App\Data\Web3\Web3Erc20TokenData;
use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Data\Web3\Web3NftsChunk;
use App\Enums\Chains;
use App\Enums\Service;
use App\Exceptions\NotImplementedException;
use App\Jobs\Middleware\RateLimited;
use App\Models\Collection as CollectionModel;
use App\Models\Network;
use App\Models\Wallet;
use App\Services\Traits\LoadsFromCache;
use App\Services\Web3\AbstractWeb3DataProvider;
use App\Support\Facades\Moralis;
use Carbon\Carbon;
use Illuminate\Support\Collection;

final class MoralisWeb3DataProvider extends AbstractWeb3DataProvider
{
    use LoadsFromCache;

    /**
     * @return Collection<int, Web3Erc20TokenData>
     */
    public function getWalletTokens(Wallet $wallet, Network $network): Collection
    {
        return Moralis::getWalletTokens($wallet, $network);
    }

    public function getWalletNfts(
        WalletData $wallet,
        NetworkData $network,
        string $cursor = null
    ): Web3NftsChunk {
        return Moralis::walletNfts($wallet, $network, $cursor);
    }

    public function getEnsDomain(Wallet $wallet): ?string
    {
        // This method is cached because `FetchEnsDetails` job can fail *after* retrieving ENS domain for the wallet,
        // so we don't want to run this call again in a short period of time needed for retry the job...

        return $this->fromCache(
            static fn () => Moralis::ensDomain($wallet),
            [$wallet->address]
        );
    }

    public function getNativeBalance(Wallet $wallet, Network $network): string
    {
        return Moralis::getNativeBalance($wallet, $network);
    }

    public function getBlockTimestamp(Network $network, int $blockNumber): Carbon
    {
        return $this->fromCache(
            static fn () => Moralis::getBlockTimestamp($network, $blockNumber),
            [(string) $network->id, (string) $blockNumber]
        );
    }

    public function getCollectionsNfts(CollectionModel $collection, ?string $startToken): Web3NftsChunk
    {
        throw new NotImplementedException();
    }

    /**
     * Get the middleware to be used for jobs.
     *
     * @return array<int, object>
     */
    public function getMiddleware(): array
    {
        return [new RateLimited(Service::Moralis)];
    }

    public function getNftCollectionFloorPrice(Chains $chain, string $contractAddress): ?Web3NftCollectionFloorPrice
    {
        return $this->fromCache(
            static fn () => Moralis::getNftCollectionFloorPrice($chain, $contractAddress),
            [$chain->name, $contractAddress]
        );
    }
}
