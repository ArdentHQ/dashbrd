<?php

declare(strict_types=1);

namespace App\Support\Facades;

use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Enums\Chain;
use App\Http\Client\Opensea\Data\OpenseaNftDetails;
use App\Http\Client\Opensea\OpenseaFactory;
use Illuminate\Support\Facades\Http;

/**
 * @method static Web3NftCollectionFloorPrice | null getNftCollectionFloorPrice(string $collectionSlug)
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
