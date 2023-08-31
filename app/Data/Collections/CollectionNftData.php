<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Data\Nfts\NftImagesData;
use App\Models\Nft;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class CollectionNftData extends Data
{
    /**
     * @param  DataCollection<int, CollectionTraitData>  $traits
     */
    public function __construct(
        public int $id,
        public int $collectionId,
        public ?string $name,
        public string $tokenNumber,
        public NftImagesData $images,
        #[DataCollectionOf(CollectionTraitData::class)]
        public DataCollection $traits,
    ) {
    }

    public static function fromModel(Nft $nft): self
    {
        return new self(
            id: $nft->id,
            collectionId: $nft->collection_id,
            name: $nft->name,
            tokenNumber: $nft->token_number,
            images: NftImagesData::from($nft->images()),
            traits: CollectionTraitData::collection($nft->traits),
        );
    }
}
