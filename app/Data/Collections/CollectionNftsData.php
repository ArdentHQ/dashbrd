<?php

declare(strict_types=1);

namespace App\Data\Collections;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CollectionNftsData extends Data
{
    /**
     * @param  DataCollection<int, CollectionNftData>  $paginated
     */
    public function __construct(
        #[DataCollectionOf(CollectionNftData::class)]
        public DataCollection $paginated,
    ) {
    }
}
