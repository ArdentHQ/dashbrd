<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Models\Collection;
use App\Models\CollectionTrait;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CollectionTraitFilterData extends Data
{
    public function __construct(
        public string $name,
        public string $value,
        public string $displayType,
        public float $nftsCount,
    ) {
    }

    /**
     * @return DataCollection<int, self>
     */
    public static function fromCollection(Collection $collection): DataCollection
    {
        $results = CollectionTrait::select([
            'collection_traits.display_type',
            'collection_traits.name',
            DB::raw('COALESCE(
                CAST(nft_trait.value_string AS TEXT),
                CAST(nft_trait.value_numeric AS TEXT),
                CAST(nft_trait.value_date AS TEXT)
            ) as value'),
            DB::raw('COUNT(nfts.id) as nfts_count'),
        ])
            ->leftJoin('nft_trait', 'nft_trait.trait_id', '=', 'collection_traits.id')
            ->leftJoin('nfts', 'nfts.id', '=', 'nft_trait.nft_id')
            ->where('nfts.collection_id', $collection->id)
            ->groupBy('collection_traits.name', 'collection_traits.display_type', 'nft_trait.value_string', 'nft_trait.value_numeric', 'nft_trait.value_date')
            ->orderBy('value')
            ->get()
            ->map(static function ($trait) {
                /** @var mixed $trait */
                return new self(
                    name: $trait->name,
                    value: $trait->value,
                    displayType: $trait->display_type,
                    nftsCount: $trait->nfts_count,
                );
            });

        /**
         * @var DataCollection<int, self>
         */
        return self::collection($results);
    }
}
