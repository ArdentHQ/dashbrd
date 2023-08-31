<?php

declare(strict_types=1);

namespace App\Support\Facades;

use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Enums\Chains;
use App\Http\Client\Footprint\FootprintFactory;
use Illuminate\Support\Facades\Http;

/**
 * @method static Web3NftCollectionFloorPrice | null getNftCollectionFloorPrice(Chains $chain, string $contractAddress)
 *
 * @see App\Http\Client\Footprint\FootprintPendingRequest
 */
class Footprint extends Http
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return FootprintFactory::class;
    }
}
