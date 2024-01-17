<?php

declare(strict_types=1);

namespace App\Support\Facades;

use App\Data\Wallet\WalletBalance;
use App\Data\Web3\Web3CollectionFloorPrice;
use App\Data\Web3\Web3Erc20TokenData;
use App\Data\Web3\Web3NftsChunk;
use App\Enums\Chain;
use App\Http\Client\Moralis\MoralisFactory;
use App\Models\Network;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

/**
 * @method static Collection<int, Web3Erc20TokenData> getWalletTokens(Wallet $wallet, Network $network, array{to_block?: number, token_addresses?: array<string>} $query = [])
 * @method static Web3NftsChunk getWalletNfts(Wallet $wallet, Network $network, ?string $cursor)
 * @method static string | null ensDomain(Wallet $wallet)
 * @method static string getNativeBalance(Wallet $wallet, Network $network)
 * @method static Collection<int, WalletBalance> getNativeBalances(array $walletAddresses, Network $network)
 * @method static Carbon getBlockTimestamp(Network $network, int $blockNumber)
 * @method static Web3CollectionFloorPrice | null getCollectionFloorPrice(Chain $chain, string $contractAddress)
 *
 * @see App\Http\Client\Moralis\MoralisPendingRequest
 */
class Moralis extends Http
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return MoralisFactory::class;
    }
}
