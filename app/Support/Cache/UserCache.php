<?php

declare(strict_types=1);

namespace App\Support\Cache;

use App\Models\Nft;
use App\Models\User;
use App\Support\Cache\Concerns\HandlesModelCache;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class UserCache
{
    use HandlesModelCache;

    /**
     * @var string
     */
    const TAG_MAIN = 'user';

    public function __construct(private User $user)
    {
        //
    }

    public function nftsCount(): int
    {
        return (int) $this->fromCache(
            fn () => $this->user->nfts()->count(),
            self::getNftsCountKey($this->user->id),
        );
    }

    public function hiddenNftsCount(): int
    {
        return (int) $this->fromCache(
            fn () => $this->user->nfts()->whereIn('collection_id', $this->user->hiddenCollections->modelKeys())->count(),
            self::getHiddenNftsCountKey($this->user->id),
        );
    }

    public function shownNftsCount(): int
    {
        return (int) $this->fromCache(
            fn () => $this->user->nfts()->whereNotIn('collection_id', $this->user->hiddenCollections->modelKeys())->count(),
            self::getShownNftsCountKey($this->user->id),
        );
    }

    public function clearNftsCount(): self
    {
        self::clearCache(self::getNftsCountKey($this->user->id));
        self::clearCache(self::getHiddenNftsCountKey($this->user->id));
        self::clearCache(self::getShownNftsCountKey($this->user->id));

        return $this;
    }

    private static function getNftsCountKey(int $userId): string
    {
        return self::getCacheKey(
            [
                'user_nfts_count',
                $userId,
            ],
        );
    }

    private static function getHiddenNftsCountKey(int $userId): string
    {
        return self::getCacheKey(
            [
                'user_hidden_nfts_count',
                $userId,
            ],
        );
    }

    private static function getShownNftsCountKey(int $userId): string
    {
        return self::getCacheKey(
            [
                'user_shown_nfts_count',
                $userId,
            ],
        );
    }

    public function collectionsCount(): int
    {
        return (int) $this->fromCache(
            fn () => $this->user->nfts()->distinct('collection_id')->count(),
            self::getCollectionsCountKey($this->user->id),
        );
    }

    public function hiddenCollectionsCount(): int
    {
        return (int) $this->fromCache(
            fn () => $this->user->nfts()->distinct('collection_id')->whereIn('collection_id', $this->user->hiddenCollections->modelKeys())->count(),
            self::getHiddenCollectionsCountKey($this->user->id),
        );
    }

    public function shownCollectionsCount(): int
    {
        return (int) $this->fromCache(
            fn () => $this->user->nfts()->distinct('collection_id')->whereNotIn('collection_id', $this->user->hiddenCollections->modelKeys())->count(),
            self::getShownCollectionsCountKey($this->user->id),
        );
    }

    public function clearCollectionsCount(): self
    {
        self::clearCache(self::getCollectionsCountKey($this->user->id));
        self::clearCache(self::getHiddenCollectionsCountKey($this->user->id));
        self::clearCache(self::getShownCollectionsCountKey($this->user->id));

        return $this;
    }

    private static function getCollectionsCountKey(int $userId): string
    {
        return self::getCacheKey(
            [
                'user_collections_count',
                $userId,
            ],
        );
    }

    private static function getHiddenCollectionsCountKey(int $userId): string
    {
        return self::getCacheKey(
            [
                'user_hidden_collections_count',
                $userId,
            ],
        );
    }

    private static function getShownCollectionsCountKey(int $userId): string
    {
        return self::getCacheKey(
            [
                'user_shown_collections_count',
                $userId,
            ],
        );
    }

    public function galleriesCount(): int
    {
        return (int) $this->fromCache(
            fn () => $this->user->galleries()->count(),
            self::getGalleriesCountKey($this->user->id),
        );
    }

    public function clearGalleriesCount(): self
    {
        self::clearCache(self::getGalleriesCountKey($this->user->id));

        return $this;
    }

    private static function getGalleriesCountKey(int $userId): string
    {
        return self::getCacheKey(
            [
                'user_gallery_count',
                $userId,
            ],
        );
    }

    /**
     * @return Collection<int, Nft>
     */
    public function userDetailNfts(): Collection
    {
        return Cache::tags([self::tag()])
            ->remember(
                self::getUserDetailNftsKey($this->user->id),
                Carbon::now()->addHours(2),
                fn () => $this->user->nfts()->inRandomOrder()->take(4)->get()
            );
    }

    public function clearUserDetailNfts(): self
    {
        self::clearCache(self::getUserDetailNftsKey($this->user->id));

        return $this;
    }

    public static function clearAll(User $user): void
    {
        self::from($user)
            ->clearNftsCount()
            ->clearCollectionsCount()
            ->clearGalleriesCount()
            ->clearUserDetailNfts();
    }

    private static function getUserDetailNftsKey(int $userId): string
    {
        return self::getCacheKey(
            [
                'user_detail_nfts',
                $userId,
            ],
        );
    }
}
