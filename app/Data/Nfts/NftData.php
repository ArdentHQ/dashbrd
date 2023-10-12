<?php

declare(strict_types=1);

namespace App\Data\Nfts;

use App\Models\Nft;
use DateTime;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class NftData extends Data
{
    public function __construct(
        public int $id,
        public ?string $name,
        public string $tokenNumber,
        public NftCollectionData $collection,
        public NftImagesData $images,
        public ?NftWalletData $wallet,
        public ?DateTime $lastViewedAt,
        public ?DateTime $lastActivityFetchedAt
    ) {
    }

    public static function fromModel(Nft $nft): self
    {
        return new self(
            id: $nft->id,
            name: $nft->name,
            tokenNumber: $nft->token_number,
            collection: NftCollectionData::fromModel($nft->collection),
            images: NftImagesData::from($nft->images()),
            wallet: $nft->wallet_id ? NftWalletData::fromModel($nft->wallet) : null,
            lastViewedAt: $nft->last_viewed_at,
            lastActivityFetchedAt: $nft->collection->activity_updated_at,
        );
    }
}
