<?php

declare(strict_types=1);

namespace App\Data\Gallery;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\PaginatedDataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class GalleriesData extends Data
{
    /**
     * @param  PaginatedDataCollection<int, GalleryData>  $paginated
     */
    public function __construct(
        #[DataCollectionOf(GalleryData::class)]
        public PaginatedDataCollection $paginated,
    ) {
    }
}
