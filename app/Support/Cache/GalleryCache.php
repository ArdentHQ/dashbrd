<?php

declare(strict_types=1);

namespace App\Support\Cache;

use App\Data\Nfts\NftCollectionData;
use App\Enums\CurrencyCode;
use App\Models\Gallery;
use App\Models\GalleryDirty;
use App\Support\Cache\Concerns\HandlesModelCache;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\DataCollection;

class GalleryCache
{
    use HandlesModelCache;

    /**
     * @var string
     */
    const TAG_MAIN = 'gallery';

    /**
     * @var string
     */
    const TAG_COLLECTIONS = 'gallery_collections';

    public function __construct(private Gallery $gallery)
    {
    }

    public function nftsCount(): int
    {
        return (int) $this->fromCache(
            fn () => $this->gallery->nftsCount(),
            self::getNftsCountKey($this->gallery->id),
        );
    }

    public function clearNftsCount(): void
    {
        self::clearCache(self::getNftsCountKey($this->gallery->id));
    }

    private static function getNftsCountKey(int $galleryId): string
    {
        return self::getCacheKey(
            [
                'gallery_nfts_count',
                $galleryId,
            ],
        );
    }

    public function collectionsCount(): int
    {
        return (int) $this->fromCache(
            fn () => $this->gallery->collectionsCount(),
            self::getCollectionsCountKey($this->gallery->id),
        );
    }

    public function clearCollectionsCount(): void
    {
        self::clearCache(self::getCollectionsCountKey($this->gallery->id));
    }

    private static function getCollectionsCountKey(int $galleryId): string
    {
        return self::getCacheKey(
            [
                'gallery_collections_count',
                $galleryId,
            ],
        );
    }

    /**
     * @return DataCollection<int, NftCollectionData>
     */
    public function collections(CurrencyCode $currencyCode): DataCollection
    {
        return $this->fromCache(
            fn () => NftCollectionData::collection(
                $this->gallery->collections()->map(fn ($collection) => NftCollectionData::fromModel($collection, $currencyCode)
                )),
            self::getCollectionsCacheKey($this->gallery->id, $currencyCode),
            [self::TAG_COLLECTIONS, self::TAG_COLLECTIONS.'_'.$this->gallery->id],
        );
    }

    public static function clearCollections(int $galleryId = null): void
    {
        $tags = $galleryId ? [self::TAG_COLLECTIONS.'_'.$galleryId] : [self::TAG_COLLECTIONS];

        Cache::tags($tags)->flush();
    }

    private static function getCollectionsCacheKey(int $galleryId, CurrencyCode $currencyCode): string
    {
        return self::getCacheKey([
            'gallery_collections',
            $currencyCode->value,
            $galleryId,
        ]);
    }

    public function clearAll(): void
    {
        $this->clearNftsCount();
        $this->clearCollections();
        $this->clearCollectionsCount();
    }

    public static function clearAllDirty(): void
    {
        DB::transaction(function () {
            $dirties = GalleryDirty::query()->get();

            // Clear cache for collections to all currencies
            $dirties->each(function (GalleryDirty $dirty) {
                self::clearCollections($dirty->gallery_id);
            });

            // Clear cache for rest of the values
            $dirties->each(function (GalleryDirty $dirty) {
                collect([
                    self::getNftsCountKey($dirty->gallery_id),
                    self::getCollectionsCountKey($dirty->gallery_id),
                ])->each(fn ($key) => self::clearCache($key));
            });

            Gallery::updateValues(
                $dirties->pluck('gallery_id')->toArray()
            );

            GalleryDirty::whereIn('gallery_id', $dirties)
                ->delete();
        });
    }
}
