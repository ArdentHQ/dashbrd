<?php

declare(strict_types=1);

namespace App\Data\Token;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\PaginatedDataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class TokenPricesData extends Data
{
    /**
     * @param  PaginatedDataCollection<int, TokenPriceData>  $paginated
     */
    public function __construct(
        #[DataCollectionOf(TokenPriceData::class)]
        public PaginatedDataCollection $paginated,
    ) {
    }
}
