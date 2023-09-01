<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Gallery\GalleriesData;
use App\Data\Gallery\GalleryData;
use App\Enums\CurrencyCode;
use App\Models\Gallery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GalleryFiltersController extends Controller
{
    public function index(Request $request): JsonResponse|Response
    {
        $filter = $request->segment(2);

        if ($request->wantsJson()) {
            return $this->list($request, $filter);
        }

        return Inertia::render('Galleries/FilterView', ['type' => $filter, 'allowsGuests' => true])->withViewData([
            'title' => trans(sprintf('metatags.galleries.%s.title', Str::slug($filter, '_'))),
        ]);
    }

    private function list(Request $request, string $filter): JsonResponse
    {
        $user = $request->user();

        $queries = [
            'most-popular' => Gallery::popular(),
            'most-valuable' => Gallery::mostValuable($user?->currency() ?? CurrencyCode::USD),
            'newest' => Gallery::latest(),
        ];

        $query = $queries[$filter] ?? $queries['newest'];

        $searchQuery = $request->get('query');

        $popular = $query
            ->search($searchQuery)
            ->paginate(12)
            ->appends(['query' => $searchQuery]);

        $galleries = new GalleriesData(GalleryData::collection($popular));

        return new JsonResponse($galleries);
    }
}
