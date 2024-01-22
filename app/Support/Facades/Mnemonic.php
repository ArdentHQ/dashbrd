<?php

declare(strict_types=1);

namespace App\Support\Facades;

use App\Data\Web3\CollectionActivity;
use App\Data\Web3\Web3CollectionFloorPrice;
use App\Data\Web3\Web3CollectionTrait;
use App\Enums\Chain;
use App\Enums\Period;
use App\Http\Client\Mnemonic\MnemonicFactory;
use App\Models\Network;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

/**
 * @method static string getNativeBalance(Wallet $wallet, Network $network)
 * @method static Web3CollectionFloorPrice | null getCollectionFloorPrice(Chain $chain, string $contractAddress)
 * @method static string | null getCollectionBanner(Chain $chain, string $contractAddress)
 * @method static int | null getCollectionOwners(Chain $chain, string $contractAddress)
 * @method static string | null getCollectionVolume(Chain $chain, string $contractAddress)
 * @method static Collection<int, Web3CollectionTrait> getCollectionTraits(Chain $chain, string $contractAddress)
 * @method static string | null getAverageCollectionVolume(Chain $chain, string $contractAddress, Period $period)
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
