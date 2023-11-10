<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Data\Gallery\GalleryNftData;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\LaravelData\DataCollection;

class UserNftController extends Controller
{
    public function __invoke(Request $request): DataCollection
    {
        $ids = array_map(fn ($item) => intval($item), explode(',', $request->get('ids', '') ?? ''));

        /** @var User $user */
        $user = $request->user();

        return GalleryNftData::collection($user->nfts()->whereIn('nfts.id', $ids)->get());
    }
}
