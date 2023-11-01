<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Gallery\GalleriesCardData;
use App\Data\Gallery\GalleryCardData;
use App\Repositories\GalleryRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\LaravelData\PaginatedDataCollection;

class FilteredGalleryController extends Controller
{
    /**
     * @param  "most-valuable"|"newest"|"most-popular"  $filter
     */
    public function index(Request $request, GalleryRepository $repository, string $filter): JsonResponse|Response
    {
        if ($request->wantsJson()) {
            $user = $request->user();

            /** @var string|null */
            $search = $request->query('query');

            $galleries = $repository->all(
                user: $request->user(),
                filter: $filter,
                searchQuery: $search,
            )->appends([
                'query' => $search,
            ])->through(fn ($gallery) => GalleryCardData::fromModel($gallery, $user));

            /** @var PaginatedDataCollection<int, GalleryCardData> */
            $galleries = GalleryCardData::collection($galleries);

            return response()->json(new GalleriesCardData($galleries));
        }

        $metatags = trans(sprintf('metatags.galleries.%s', Str::slug($filter, '_')));

        return Inertia::render('Galleries/FilterView', [
            'type' => $filter,
            'allowsGuests' => true,
        ])->withViewData([
            'title' => $metatags['title'],
            'image' => $metatags['image'],
            'description' => $metatags['description'],
        ]);
    }
}
