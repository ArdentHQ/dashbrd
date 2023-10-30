<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Gallery\GalleriesStatsData;
use App\Data\Gallery\GalleryCardData;
use App\Data\Gallery\GalleryData;
use App\Data\Gallery\GalleryStatsData;
use App\Enums\CurrencyCode;
use App\Models\GalleriesStats;
use App\Models\Gallery;
use App\Repositories\GalleriesRepository;
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

    public function galleries(Request $request, GalleriesRepository $galleries): JsonResponse
    {
        $user = $request->user();

        $popular = $galleries->popular($user);
        $newest = $galleries->latest($user);
        $mostValuable = $galleries->mostValuable($user);

        return response()->json([
            'popular' => $popular->map(fn ($gallery) => GalleryCardData::fromModel($gallery, $user)),
            'newest' => $newest->map(fn ($gallery) => GalleryCardData::fromModel($gallery, $user)),
            'mostValuable' => $mostValuable->map(fn ($gallery) => GalleryCardData::fromModel($gallery, $user)),
        ]);
    }

    public function show(Request $request, Gallery $gallery): Response
    {
        $galleryCache = new GalleryCache($gallery);

        $user = $request->user();

        $reportAvailableIn = RateLimiterHelpers::galleryReportAvailableInHumanReadable($request, $gallery);

        return Inertia::render('Galleries/View', [
            'title' => trans('metatags.galleries.view.title', ['name' => $gallery->name]),
            'gallery' => GalleryData::fromModel(
                gallery: $gallery->loadCount('views'),
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
            'showReportModal' => $request->boolean('report'),
        ])->withViewData([
            'title' => trans('metatags.galleries.view.title', ['name' => $gallery->name]),
            'description' => trans('metatags.galleries.view.description', ['name' => $gallery->name]),
            'image' => route('galleries.meta-image', ['gallery' => $gallery->slug]),
        ]);
    }
}
