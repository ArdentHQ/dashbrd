<?php

declare(strict_types=1);

namespace App\Support;

use App\Data\Web3\Web3NftCollectionTrait;
use App\Models\CollectionTrait;
use Illuminate\Support\Collection;

class Web3NftCollectionHandler
{
    public function __construct()
    {
        //
    }

    /**
     * @param  Collection<int, Web3NftCollectionTrait>  $traits
     */
    public function storeTraits(int $collectionId, Collection $traits): void
    {
        $filteredTraits = $traits->filter(fn ($trait) => CollectionTrait::isValidValue($trait->value));

        CollectionTrait::upsert($filteredTraits->map(function (Web3NftCollectionTrait $trait) use ($collectionId) {
            return [
                'collection_id' => $collectionId,
                'name' => $trait->name,

                'value' => $trait->value,
                'display_type' => $trait->displayType->value,

                'value_min' => $trait->valueMin,
                'value_max' => $trait->valueMax,

                'nfts_count' => $trait->nftsCount,
                'nfts_percentage' => $trait->nftsPercentage,
            ];
        })->toArray(),
            ['collection_id', 'name', 'value'],
            ['display_type', 'value_min', 'value_max', 'nfts_count', 'nfts_percentage']);
    }
}
