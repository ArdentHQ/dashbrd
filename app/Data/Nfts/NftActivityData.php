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

    public static function fromModel(NftActivity $activity): self
    {
        return new self(
            id: $activity->tx_hash,
            sender: $activity->sender,
            recipient: $activity->recipient,
            timestamp: (int) $activity->timestamp->timestamp,
            nft: CollectionNftData::fromModel($activity->nft),
            type: $activity->type,
            totalNative: $activity->total_native ?? null,
            totalUsd: $activity->total_usd ?? null,
        );
    }
}
