<?php

declare(strict_types=1);

namespace App\Support\Facades;

use App\Data\Web3\Web3ContractMetadata;
use App\Data\Web3\Web3Erc20TokenData;
use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Data\Web3\Web3NftData;
use App\Data\Web3\Web3NftsChunk;
use App\Enums\Chains;
use App\Http\Client\Alchemy\AlchemyFactory;
use App\Models\Collection as CollectionModel;
use App\Models\Network;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

/**
 * @method static Collection<int, Web3Erc20TokenData> getWalletTokens(Wallet $wallet, Network $network) $query = [])
 * @method static Web3NftsChunk getWalletNfts(Wallet $wallet, Network $network, ?string $cursor = null, ?int $limit = null) $query = [])
 * @method static Web3NftsChunk collectionNfts(CollectionModel $collection, ?string $startToken = null, ?int $limit = null)
 * @method static Web3NftsChunk nftMetadata(Collection $nfts, Network $network)
 * @method static array collectionNftsRaw(CollectionModel $collection, ?string $startToken = null)
 * @method static array<string> getSpamContracts(Network $network)
 * @method static Collection<int, Web3ContractMetadata> getContractMetadataBatch(array $contractAddresses, Network $network)
 * @method static Web3NftData parseNft(array $nft, int $networkId)
 * @method static string getNativeBalance(Wallet $wallet, Network $network)
 * @method static Carbon getBlockTimestamp(Network $network, int $blockNumber)
 * @method static Web3NftCollectionFloorPrice | null getNftCollectionFloorPrice(Chains $chain, string $contractAddress)
 *
 * @see App\Http\Client\Alchemy\AlchemyPendingRequest
 */
class Alchemy extends Http
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return AlchemyFactory::class;
    }
}
