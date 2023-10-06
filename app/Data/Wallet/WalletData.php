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
    'nfts' => 'WalletNftData[]',
    'nftCount' => 'number',
    'collectionCount' => 'number',
    'collectionsValue' => 'number | null',
    'galleryCount' => 'number',
    'timestamps' => '{tokens_fetched_at: number|null, native_balances_fetched_at: number|null}',
    'isRefreshingCollections' => 'boolean',
    'canRefreshCollections' => 'boolean',
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
        /**
         * @var WalletNftData[]
         */
        public array $nfts,
        public int $nftCount,
        public int $collectionCount,
        public ?float $collectionsValue,
        public int $galleryCount,
        public int $userId,

        public bool $isLocalTestingAddress,
        /**
         * @var array{tokens_fetched_at: int|null, native_balances_fetched_at: int|null} $timestamps
         */
        public array $timestamps,

        public bool $isRefreshingCollections,
        public bool $canRefreshCollections,
    ) {
    }

    public static function fromModel(Wallet $wallet): self
    {
        $domain = $wallet->details?->domain;
        $avatarData = WalletAvatarData::fromModel($wallet);
        $userCache = UserCache::from($wallet->user);

        $user = $wallet->user;

        return new self(
            $wallet['id'],
            $wallet['address'],
            $domain,
            $avatarData,
            $wallet['total_usd'],
            $wallet->totalBalanceInCurrency(),
            $wallet->totalTokens(),
            $userCache->userDetailNfts()->filter(fn ($nft) => ! is_null($nft->collection))->map(fn ($nft) => WalletNftData::fromModel($nft))->all(),
            $userCache->nftsCount(),
            $userCache->collectionsCount(),
            $user->collectionsValue($user->currency()),
            $userCache->galleriesCount(),
            $user->id,
            $wallet->isLocalTestingAddress(),
            [
                'tokens_fetched_at' => $wallet->tokensFetchedAt()?->getTimestampMs(),
                'native_balances_fetched_at' => $wallet->nativeBalancesFetchedAt()?->getTimestampMs(),
            ],
            isRefreshingCollections: (bool) $wallet->is_refreshing_collections,
            canRefreshCollections: $wallet->canRefreshCollections(),
        );
    }
}
