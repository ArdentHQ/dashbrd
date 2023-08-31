<?php

declare(strict_types=1);

namespace App\Support\Facades;

use App\Data\Wallet\WalletData;
use App\Data\Web3\Web3Erc20TokenData;
use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Data\Web3\Web3NftCollectionTrait;
use App\Data\Web3\Web3NftTransfer;
use App\Enums\Chains;
use App\Http\Client\Mnemonic\MnemonicFactory;
use App\Models\Network;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

/**
 * @method static Collection<int, Web3Erc20TokenData> erc20(WalletData $wallet) $query = [])
 * @method static string getNativeBalance(Wallet $wallet, Network $network)
 * @method static Web3NftCollectionFloorPrice | null getNftCollectionFloorPrice(Chains $chain, string $contractAddress)
 * @method static string | null getNftCollectionBanner(Chains $chain, string $contractAddress)
 * @method static int | null getNftCollectionOwners(Chains $chain, string $contractAddress)
 * @method static string | null getNftCollectionVolume(Chains $chain, string $contractAddress)
 * @method static Collection<int, Web3NftCollectionTrait> getNftCollectionTraits(Chains $chain, string $contractAddress)
 * @method static Collection<int, Web3NftTransfer> getNftActivity(Chains $chain, string $contractAddress, string $tokenId, int $limit, ?Carbon $from = null)
 *
 * @see App\Http\Client\Mnemonic\MnemonicPendingRequest
 */
class Mnemonic extends Http
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return MnemonicFactory::class;
    }
}
