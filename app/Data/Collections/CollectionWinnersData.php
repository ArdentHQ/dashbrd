<?php

declare(strict_types=1);

namespace App\Data\Collections;

use Illuminate\Support\Collection;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CollectionWinnersData extends Data
{
    /**
     * @param  Collection<int, CollectionOfTheMonthData>  $winners
     */
    public function __construct(
        public int $month,
        public int $year,
        #[LiteralTypeScriptType('App.Data.Collections.CollectionOfTheMonthData[]')]
        public Collection $winners,
    ) {
    }
}
