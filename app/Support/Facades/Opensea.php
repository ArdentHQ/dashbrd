<?php

declare(strict_types=1);

namespace App\Support\Facades;

use App\Data\Web3\Web3CollectionFloorPrice;
use App\Enums\Chain;
use App\Http\Client\Opensea\Data\OpenseaNftDetails;
use App\Http\Client\Opensea\OpenseaFactory;
use App\Models\Collection;
use Illuminate\Support\Facades\Http;

/**
 * @method static string getCollectionTotalVolume(Collection $collection)
 * @method static Web3CollectionFloorPrice | null getCollectionFloorPrice(string $collectionSlug)
 * @method static int|null getCollectionSupply(string $collectionSlug)
 * @method static OpenseaNftDetails | null nft(Chain $chain, string $address, string $identifier)
 *
 * @see App\Http\Client\Opensea\OpenseaPendingRequest
 */
class Opensea extends Http
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return OpenseaFactory::class;
    }
}
