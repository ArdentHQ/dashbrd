<?php

declare(strict_types=1);

namespace App\Data\Articles;

use App\Data\Nfts\NftCollectionData;
use App\Data\Nfts\NftImagesData;
use App\Data\Nfts\NftWalletData;
use App\Enums\ArticleCategoryEnum;
use App\Models\Article;
use App\Models\Nft;
use DateTime;
use Illuminate\Database\Eloquent\Collection;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class FeaturedCollectionData extends Data
{
    public function __construct(
        public string $name,
        public ?string $image,
    ) {
    }

    public static function fromModel(Collection $collection): self
    {
        return new self(
            name: $collection->name,
            image: $collection->collection_image
        );
    }
}
