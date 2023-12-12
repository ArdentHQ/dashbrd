<?php

declare(strict_types=1);

namespace App\Support\Facades;

use App\Data\Web3\CollectionActivity;
use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Data\Web3\Web3NftCollectionTrait;
use App\Enums\Chain;
use App\Http\Client\Mnemonic\MnemonicFactory;
use App\Models\Network;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

/**
 * @method static string getNativeBalance(Wallet $wallet, Network $network)
 * @method static Web3NftCollectionFloorPrice | null getNftCollectionFloorPrice(Chain $chain, string $contractAddress)
 * @method static string | null getNftCollectionBanner(Chain $chain, string $contractAddress)
 * @method static int | null getNftCollectionOwners(Chain $chain, string $contractAddress)
 * @method static string | null getNftCollectionVolume(Chain $chain, string $contractAddress)
 * @method static Collection<int, Web3NftCollectionTrait> getNftCollectionTraits(Chain $chain, string $contractAddress)
 * @method static Collection<int, CollectionActivity> getCollectionActivity(Chain $chain, string $contractAddress, int $limit, ?Carbon $from = null)
 * @method static Collection<int, CollectionActivity> getBurnActivity(Chain $chain, string $contractAddress, int $limit, ?Carbon $from = null)
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
