<?php

declare(strict_types=1);

namespace App\Data\Web3;

use Illuminate\Support\Collection;

readonly class Web3NftsChunk
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
