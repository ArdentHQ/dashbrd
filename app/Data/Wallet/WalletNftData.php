<?php

declare(strict_types=1);

namespace App\Data\Wallet;

use App\Data\ImagesData;
use App\Models\Nft;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class WalletNftData extends Data
{
    public function __construct(
        public int $id,
        public ImagesData $images,
    ) {
    }

    public static function fromModel(Nft $nft): self
    {
        return new self(
            id: $nft->id,
            images: ImagesData::from($nft->images()),
        );
    }
}
