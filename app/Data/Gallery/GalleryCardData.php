<?php

declare(strict_types=1);

namespace App\Data\Gallery;

use App\Data\Collections\SimpleNftData;
use App\Data\SimpleWalletData;
use App\Enums\CurrencyCode;
use App\Models\Gallery;
use App\Models\User;
use App\Support\Cache\GalleryCache;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class GalleryCardData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public int $likes,
        public int $views,
        public int $nftsCount,
        public int $collectionsCount,
        public ?float $value,
        public ?string $coverImage,
        public SimpleWalletData $wallet,
        /** @var DataCollection<int, SimpleNftData> */
        #[DataCollectionOf(SimpleNftData::class)]
        public DataCollection $nfts,
        public bool $isOwner = false,
        public bool $hasLiked = false,
    ) {
    }

    public static function fromModel(Gallery $gallery, ?User $user): self
    {
        $galleryCache = new GalleryCache($gallery);

        /** @var DataCollection<int, SimpleNftData> */
        $nfts = SimpleNftData::collection($gallery->nfts);

        return new self(
            id: $gallery->id,
            name: $gallery->name,
            slug: $gallery->slug,
            likes: $gallery->likes_count,
            views: $gallery->views_count,
            nftsCount: $gallery->nfts_count,
            collectionsCount: $galleryCache->collectionsCount(),
            value: $gallery->value($user?->currency() ?? CurrencyCode::USD),
            coverImage: $gallery->cover_image,
            wallet: SimpleWalletData::fromModel($gallery->user->wallet),
            nfts: $nfts,
            isOwner: $user !== null ? $user->id === $gallery->user_id : false,
            hasLiked: $user !== null ? $gallery->likes->isNotEmpty() : false,
        );
    }
}
