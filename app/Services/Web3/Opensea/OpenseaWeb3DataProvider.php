<?php

declare(strict_types=1);

namespace App\Services\Web3\Opensea;

use App\Data\Web3\Web3CollectionFloorPrice;
use App\Data\Web3\Web3NftsChunk;
use App\Enums\Chain;
use App\Enums\Service;
use App\Exceptions\NotImplementedException;
use App\Jobs\Middleware\RateLimited;
use App\Models\Collection as CollectionModel;
use App\Models\Network;
use App\Models\Wallet;
use App\Services\Traits\LoadsFromCache;
use App\Services\Web3\AbstractWeb3DataProvider;
use App\Support\Facades\Opensea;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Collection;

final class OpenseaWeb3DataProvider extends AbstractWeb3DataProvider
{
    use LoadsFromCache;
    use WithFaker;

    public function getWalletTokens(Wallet $wallet, Network $network): Collection
    {
        throw new NotImplementedException();
    }

    public function getWalletNfts(Wallet $wallet, Network $network, ?string $cursor = null): Web3NftsChunk
    {
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

    public function getCollectionFloorPrice(Chain $chain, string $contractAddress): ?Web3CollectionFloorPrice
    {
        return $this->fromCache(
            function () use ($contractAddress, $chain) {
                $collection = CollectionModel::where('address', $contractAddress)
                    ->whereHas('network', fn ($query) => $query->where('chain_id', $chain->value))
                    ->firstOrFail();

                $openseaSlug = $collection->openSeaSlug();

                if ($openseaSlug === null) {
                    return null;
                }

                return Opensea::getCollectionFloorPrice($openseaSlug);
            },
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
        return [new RateLimited(Service::Opensea)];
    }
}
