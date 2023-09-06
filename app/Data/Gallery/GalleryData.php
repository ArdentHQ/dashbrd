<?php

declare(strict_types=1);

namespace App\Data\Gallery;

use App\Enums\CurrencyCode;
use App\Models\Gallery;
use App\Support\Cache\GalleryCache;
use Illuminate\Support\Facades\Auth;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class GalleryData extends Data
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
        public GalleryWalletData $wallet,
        public GalleryNftsData $nfts,
        public bool $isOwner = false,
        public bool $hasLiked = false,
    ) {
    }

    public static function fromModel(Gallery $gallery, ?int $limit = 6): self
    {
        $currency = CurrencyCode::USD;

        if (Auth::hasUser()) {
            $currency = Auth::user()->currency();
        }

        $galleryCache = new GalleryCache($gallery);

        return new self(
            id: $gallery->id,
            name: $gallery->name,
            slug: $gallery->slug,
            likes: $gallery->likeCount,
            views: $gallery->loadCount('views')->views_count,
            nftsCount: $galleryCache->nftsCount(),
            collectionsCount: $galleryCache->collectionsCount(),
            value: $gallery->value($currency),
            coverImage: $gallery->cover_image,
            wallet: GalleryWalletData::fromModel($gallery->user->wallet),
            nfts: new GalleryNftsData(GalleryNftData::collection($gallery->nfts()->orderByPivot('order_index', 'asc')->paginate($limit))),
            isOwner: $gallery->user->id === Auth::user()->id,
            hasLiked: $gallery->isLikedBy(Auth::user()),
        );
    }
}
