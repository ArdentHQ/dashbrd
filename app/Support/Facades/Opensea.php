<?php

declare(strict_types=1);

namespace App\Support\Facades;

use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Http\Client\Opensea\OpenseaFactory;
use Illuminate\Support\Facades\Http;

/**
 * @method static Web3NftCollectionFloorPrice | null getNftCollectionFloorPrice(string $collectionSlug)
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
