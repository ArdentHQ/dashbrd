<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Gallery\GalleriesStatsData;
use App\Data\Gallery\GalleryData;
use App\Data\Gallery\GalleryStatsData;
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
        ]);
    }

    public function galleries(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $popular = Gallery::popular()->limit(8)->get();

        $newest = Gallery::latest()->limit(8)->get();

        $mostValuable = Gallery::mostValuable($user->currency())->limit(8)->get();

        return response()->json([
            'popular' => GalleryData::collection($popular),
            'newest' => GalleryData::collection($newest),
            'mostValuable' => GalleryData::collection($mostValuable),
        ]);
    }

    public function view(Request $request, Gallery $gallery): Response
    {
        $galleryCache = new GalleryCache($gallery);

        /** @var User $user */
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
            'collections' => $galleryCache->collections($user->currency()),
            'alreadyReported' => $gallery->wasReportedByUserRecently($user),
            'reportAvailableIn' => $reportAvailableIn,
        ]);
    }

    public function like(Request $request, Gallery $gallery): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($gallery->isLikedBy($user)) {
            $gallery->removeLike($user);

            return response()->json(['likes' => $gallery->likeCount, 'hasLiked' => $gallery->isLikedBy($user)], 201);
        }

        $gallery->addLike($user);

        return response()->json(['likes' => $gallery->likeCount, 'hasLiked' => $gallery->isLikedBy($user)], 201);
    }
}
