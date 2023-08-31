<?php

declare(strict_types=1);

namespace App\Data\Web3;

use Illuminate\Support\Collection;
use Spatie\LaravelData\Data;

class Web3NftsChunk extends Data
{
    /**
     * @param  Collection<int, Web3NftData>  $nfts
     */
    public function __construct(
        public Collection $nfts,
        public ?string $nextToken,
    ) {
    }
}
