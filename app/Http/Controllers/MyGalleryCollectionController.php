<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Gallery\GalleryCollectionData;
use App\Data\Gallery\GalleryCollectionsData;
use App\Data\Gallery\GalleryNftData;
use App\Enums\TokenType;
use App\Models\Collection;
use App\Models\Nft;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MyGalleryCollectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $collections = $user
            ->collections()
            ->where('collections.name', 'ilike', sprintf('%%%s%%', $request->get('query')))
            ->withUserNftsCount($user)
            ->orderBy('id')
            ->paginate(config('dashbrd.gallery.pagination.collections_per_page'));

        $nfts = Nft::paginatedCollectionNfts(
            $collections,
            $user,
            (int) config('dashbrd.gallery.pagination.nfts_per_page')
        );

        return new JsonResponse([
            'nfts' => GalleryNftData::collection($nfts),
            'collections' => new GalleryCollectionsData(GalleryCollectionData::collection($collections)),
        ]);
    }

    public function nfts(Request $request, Collection $collection): JsonResponse
    {
        abort_if($collection->type !== TokenType::Erc721, 404);

        $page = ($request->page ?? 1) - 1;
        $nftsPerPage = (int) config('dashbrd.gallery.pagination.nfts_per_page');

        $nfts = $collection
            ->nfts()
            ->whereIn('wallet_id', $request->user()->wallets()->select('id'))
            ->orderBy('id')
            ->skip($nftsPerPage * $page)
            ->take($nftsPerPage)
            ->get();

        return new JsonResponse([
            'nfts' => GalleryNftData::collection($nfts),
        ]);
    }
}
