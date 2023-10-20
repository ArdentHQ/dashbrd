<?php

declare(strict_types=1);

namespace App\Data\Nfts;

use App\Data\Collections\CollectionNftData;
use App\Enums\NftTransferType;
use App\Enums\TokenGuid;
use App\Models\Collection;
use App\Models\Network;
use App\Models\NftActivity;
use App\Models\TokenPriceHistory;
use Carbon\Carbon;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
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
        #[LiteralTypeScriptType('App.Enums.NftTransferType')]
        public NftTransferType $type,
        public ?string $totalNative,
        public ?string $totalUsd
    ) {
    }

    private static function formatNative(string $totalNative, string $totalUsd, NftTransferType $label, Carbon $timestamp, int $collectionId): string {
        $polygonNetwork = Network::polygon();
        $collection = Collection::where('id', $collectionId)->first();

        if($label === NftTransferType::Sale && $collection->network_id === $polygonNetwork->id) {
            $polygonGuid = TokenGuid::Polygon->value;

            $totalNative = bcdiv($totalUsd, TokenPriceHistory::query()->where('currency', 'usd')->where('token_guid', $polygonGuid)->where('timestamp', '<=', $timestamp)->orderBy('timestamp', 'desc')->first()->price, 18);
        }

        return $totalNative;
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
            totalNative: $nftActivity->total_native ? static::formatNative($nftActivity->total_native, $nftActivity->total_usd, $nftActivity->type, $nftActivity->timestamp, $nftActivity->collection_id) : null,
            totalUsd: $nftActivity->total_usd ?? null,
        );
    }
}
