<?php

declare(strict_types=1);

namespace App\Data\Articles;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\PaginatedDataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ArticlesData extends Data
{
    /**
     * @param  PaginatedDataCollection<int, ArticleData>  $paginated
     */
    public function __construct(
        #[DataCollectionOf(ArticleData::class)]
        public PaginatedDataCollection $paginated,
    ) {
    }
}
