<?php

declare(strict_types=1);

namespace App\Services\Web3\Footprint;

use App\Data\NetworkData;
use App\Data\Wallet\WalletData;
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
use App\Support\Facades\Footprint;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Collection;

final class FootprintWeb3DataProvider extends AbstractWeb3DataProvider
{
    use WithFaker;
    use LoadsFromCache;

    public function getWalletTokens(WalletData $wallet, NetworkData $network): Collection
    {
        throw new NotImplementedException();
    }

    public function getWalletNfts(
        WalletData $wallet,
        NetworkData $network,
        string $cursor = null
    ): Web3NftsChunk {
        throw new NotImplementedException();
    }

    public function getEnsDomain(Wallet $wallet): ?string
    {
        throw new NotImplementedException();
    }

    public function getNativeBalance(Wallet $wallet, Network $network): string
    {
        throw new NotImplementedException();
    }

    public function getCollectionsNfts(CollectionModel $collection, ?string $startToken): Web3NftsChunk
    {
        throw new NotImplementedException();
    }

    public function getNftCollectionFloorPrice(Chains $chain, string $contractAddress): ?Web3NftCollectionFloorPrice
    {
        return $this->fromCache(
            static fn () => Footprint::getNftCollectionFloorPrice($chain, $contractAddress),
            [$chain->name, $contractAddress]
        );
    }

    public function getBlockTimestamp(Network $network, int $blockNumber): Carbon
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
        return [new RateLimited(Service::Footprint)];
    }
}
