<?php

declare(strict_types=1);

namespace App\Data\Nfts;

use App\Data\Collections\CollectionNftData;
use App\Enums\NftTransferType;
use App\Models\NftActivity;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class NftActivityData extends Data
{
    public function __construct(
        public string $id,
        public string $sender,
        public string $recipient,
        public int $timestamp,
        public CollectionNftData $nft,
        public NftTransferType $type,
        public ?string $totalNative,
        public ?string $totalUsd
    ) {
    }

    public static function fromModel(NftActivity $nftActivity): self
    {
        return new self(
            id: $nftActivity->tx_hash,
            sender: $nftActivity->sender,
            recipient: $nftActivity->recipient,
            timestamp: (int) $nftActivity->timestamp->timestamp,
            nft: CollectionNftData::fromModel($nftActivity->nft),
            type: $nftActivity->type,
            totalNative: $nftActivity->total_native ?? null,
            totalUsd: $nftActivity->total_usd ?? null,
        );
    }
}
