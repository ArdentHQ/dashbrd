<?php

declare(strict_types=1);

namespace App\Data\Wallet;

use App\Models\Wallet;
use App\Support\Cache\UserCache;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[LiteralTypeScriptType([
    'address' => 'string',
    'domain' => 'string | null',
    'avatar' => 'WalletAvatarData',
    'totalUsd' => 'number',
    'totalBalanceInCurrency' => 'string',
    'totalTokens' => 'number',
    'collectionCount' => 'number',
    'galleryCount' => 'number',
    'timestamps' => '{tokens_fetched_at: number|null, native_balances_fetched_at: number|null}',
    'isRefreshingCollections' => 'boolean',
    'canRefreshCollections' => 'boolean',
    'hasErc1155Nfts' => '{eth: boolean, polygon: boolean}',
])]
class WalletData extends Data
{
    public function __construct(
        public int $id,
        public string $address,
        public ?string $domain,
        public WalletAvatarData $avatar,
        public float $totalUsd,
        public string $totalBalanceInCurrency,
        public int $totalTokens,
        public int $collectionCount,
        public int $galleryCount,
        public int $userId,
        public bool $isLocalTestingAddress,
        /**
         * @var array{tokens_fetched_at: int|null, native_balances_fetched_at: int|null} $timestamps
         */
        public array $timestamps,

        public bool $isRefreshingCollections,
        public bool $canRefreshCollections,
        /**
         * @var array{eth: bool, polygon: bool} $hasErc1155Nfts
         */
        public array $hasErc1155Nfts,
    ) {
    }

    public static function fromModel(Wallet $wallet): self
    {
        $userCache = UserCache::from($wallet->user);

        return new self(
            id: $wallet->id,
            address: $wallet->address,
            domain: $wallet->details?->domain,
            avatar: WalletAvatarData::fromModel($wallet),
            totalUsd: $wallet->total_usd,
            totalBalanceInCurrency: $wallet->totalBalanceInCurrency(),
            totalTokens: $wallet->totalTokens(),
            collectionCount: $userCache->collectionsCount(),
            galleryCount: $userCache->galleriesCount(),
            userId: $wallet->user_id,
            isLocalTestingAddress: $wallet->isLocalTestingAddress(),
            timestamps: [
                'tokens_fetched_at' => $wallet->tokensFetchedAt()?->getTimestampMs(),
                'native_balances_fetched_at' => $wallet->nativeBalancesFetchedAt()?->getTimestampMs(),
            ],
            isRefreshingCollections: (bool) $wallet->is_refreshing_collections,
            canRefreshCollections: $wallet->canRefreshCollections(),
            hasErc1155Nfts: [
                'eth' => $wallet->owns_erc1155_tokens_eth ?? false,
                'polygon' => $wallet->owns_erc1155_tokens_polygon ?? false,
            ],
        );
    }
}
