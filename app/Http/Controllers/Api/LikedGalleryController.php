<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LikedGalleryController extends Controller
{
    public function store(Request $request, Gallery $gallery): JsonResponse
    {
        $user = $request->user();

        if ($request->exists('like')) {
            if ($request->boolean('like')) {
                $gallery->addLike($user);
            } else {
                $gallery->removeLike($user);
            }
        } elseif ($gallery->isLikedBy($user)) {
            $gallery->removeLike($user);
        } else {
            $gallery->addLike($user);
        }

        return response()->json([
            'likes' => $gallery->likes()->count(),
            'hasLiked' => $gallery->isLikedBy($user)
        ], 201);
    }
}
