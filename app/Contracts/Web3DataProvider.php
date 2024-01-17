<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Data\Web3\Web3CollectionFloorPrice;
use App\Data\Web3\Web3Erc20TokenData;
use App\Data\Web3\Web3NftsChunk;
use App\Enums\Chain;
use App\Models\Collection as CollectionModel;
use App\Models\Network;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Support\Collection;

interface Web3DataProvider
{
    /**
     * @return Collection<int, Web3Erc20TokenData>
     */
    public function getWalletTokens(Wallet $wallet, Network $network): Collection;

    public function getWalletNfts(Wallet $wallet, Network $network, ?string $cursor): Web3NftsChunk;

    public function getCollectionsNfts(CollectionModel $collection, ?string $startToken): Web3NftsChunk;

    public function getEnsDomain(Wallet $wallet): ?string;

    public function getNativeBalance(Wallet $wallet, Network $network): string;

    public function getBlockTimestamp(Network $network, int $blockNumber): Carbon;

    /**
     * Get the middleware to be used for jobs.
     *
     * @return array<int, object>
     */
    public function getMiddleware(): array;

    public function getCollectionFloorPrice(Chain $chain, string $contractAddress): ?Web3CollectionFloorPrice;
}
