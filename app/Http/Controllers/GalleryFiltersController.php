<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Gallery\GalleriesData;
use App\Data\Gallery\GalleryData;
use App\Models\Gallery;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        return Inertia::render('Galleries/FilterView', ['type' => $filter]);
    }

    private function list(Request $request, string $filter): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $queries = [
            'most-popular' => Gallery::popular(),
            'most-valuable' => Gallery::mostValuable($user->currency()),
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
