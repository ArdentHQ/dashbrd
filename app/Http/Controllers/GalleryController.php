<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Gallery\GalleriesStatsData;
use App\Data\Gallery\GalleryData;
use App\Data\Gallery\GalleryStatsData;
use App\Enums\CurrencyCode;
use App\Models\GalleriesStats;
use App\Models\Gallery;
use App\Models\User;
use App\Support\Cache\GalleryCache;
use App\Support\RateLimiterHelpers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(): Response
    {
        $stats = GalleriesStats::firstOrFail();

        return Inertia::render('Galleries/Index', [
            'title' => trans('metatags.galleries.title'),
            'stats' => new GalleriesStatsData(
                $stats->totalDistinctUsers(),
                $stats->totalGalleries(),
                $stats->totalDistinctCollections(),
                $stats->totalDistinctNfts(),
            ),
            'allowsGuests' => true,
        ])
        ->withViewData([
            'title' => trans('metatags.galleries.title'),
            'image' => trans('metatags.galleries.image'),
            'description' => trans('metatags.galleries.description'),
        ]);
    }

    public function galleries(Request $request): JsonResponse
    {
        $user = $request->user();

        $popular = Gallery::popular()->limit(8)->get();

        $newest = Gallery::latest()->limit(8)->get();

        $mostValuable = Gallery::mostValuable($user?->currency() ?? CurrencyCode::USD)->limit(8)->get();

        return response()->json([
            'popular' => GalleryData::collection($popular),
            'newest' => GalleryData::collection($newest),
            'mostValuable' => GalleryData::collection($mostValuable),
        ]);
    }

    public function view(Request $request, Gallery $gallery): Response
    {
        $galleryCache = new GalleryCache($gallery);

        $user = $request->user();

        $reportAvailableIn = RateLimiterHelpers::galleryReportAvailableInHumanReadable($request, $gallery);

        return Inertia::render('Galleries/View', [
            'title' => trans('metatags.galleries.view.title', ['name' => $gallery->name]),
            'gallery' => GalleryData::fromModel(
                gallery: $gallery,
                limit: 16,
            ),
            'stats' => new GalleryStatsData(
                collections: $galleryCache->collectionsCount(),
                nfts: $galleryCache->nftsCount(),
                likes: $gallery->likes()->count(),
            ),
            'collections' => $galleryCache->collections($user?->currency() ?? CurrencyCode::USD),
            'alreadyReported' => $user === null ? false : $gallery->wasReportedByUserRecently($user),
            'reportAvailableIn' => $reportAvailableIn,
            'allowsGuests' => true,
        ])->withViewData([
            'title' => trans('metatags.galleries.view.title', ['name' => $gallery->name]),
            'description' => trans('metatags.galleries.view.description', ['name' => $gallery->name]),
            'image' => trans('metatags.galleries.view.image'),
        ]);
    }

    public function like(Request $request, Gallery $gallery): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $like = $request->has('like') ? $request->boolean('like') : null;

        if ($like !== null) {
            if ($like) {
                $gallery->addLike($user);
            } else {
                $gallery->removeLike($user);
            }
        } elseif ($gallery->isLikedBy($user)) {
            $gallery->removeLike($user);
        } else {
            $gallery->addLike($user);
        }

        return response()->json(['likes' => $gallery->likeCount, 'hasLiked' => $gallery->isLikedBy($user)], 201);
    }
}
