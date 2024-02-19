<?php

declare(strict_types=1);

namespace App\Support;

use App\Data\Web3\Web3CollectionTrait;
use App\Models\CollectionTrait;
use Illuminate\Support\Collection;

class Web3CollectionHandler
{
    public function __construct()
    {
        //
    }

    /**
     * @param  Collection<int, Web3CollectionTrait>  $traits
     */
    public function storeTraits(int $collectionId, Collection $traits): void
    {
        $filteredTraits = $traits->filter(fn ($trait) => CollectionTrait::isValidValue($trait->value));

        CollectionTrait::upsert($filteredTraits->map(function (Web3CollectionTrait $trait) use ($collectionId) {
            return [
                'collection_id' => $collectionId,
                'name' => $trait->name,
                'value' => $trait->value,
                'display_type' => $trait->displayType->value,
                'value_min' => $trait->valueMin,
                'value_max' => $trait->valueMax,
                'nfts_percentage' => $trait->nftsPercentage,
            ];
        })->toArray(),
            ['collection_id', 'name', 'value'],
            ['display_type', 'value_min', 'value_max', 'nfts_percentage']);
    }
}
