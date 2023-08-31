<?php

declare(strict_types=1);

namespace App\Data\Gallery;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\PaginatedDataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class GalleryCollectionsData extends Data
{
    /**
     * @param  PaginatedDataCollection<int, GalleryCollectionData>  $paginated
     */
    public function __construct(
        #[DataCollectionOf(GalleryCollectionData::class)]
        public PaginatedDataCollection $paginated,
    ) {
    }
}
