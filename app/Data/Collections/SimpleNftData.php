<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Data\Nfts\NftImagesData;
use App\Models\Nft;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class SimpleNftData extends Data
{
    public function __construct(
        public int $id,
        public string $tokenNumber,
        public NftImagesData $images,
    ) {
    }

    public static function fromModel(Nft $nft): self
    {
        return new self(
            id: $nft->id,
            tokenNumber: $nft->token_number,
            images: NftImagesData::from($nft->images()),
        );
    }
}
