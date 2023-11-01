<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Data\Gallery\GalleryCardData;
use App\Http\Controllers\Controller;
use App\Repositories\GalleryRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function index(Request $request, GalleryRepository $galleries): JsonResponse
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
}
