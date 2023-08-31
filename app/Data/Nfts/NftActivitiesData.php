<?php

declare(strict_types=1);

namespace App\Data\Nfts;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\PaginatedDataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class NftActivitiesData extends Data
{
    /**
     * @param  PaginatedDataCollection<int, NftActivityData>  $paginated
     */
    public function __construct(
        #[DataCollectionOf(NftActivityData::class)]
        public PaginatedDataCollection $paginated,
    ) {
    }
}
