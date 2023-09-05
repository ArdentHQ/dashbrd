<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Gallery\GalleriesData;
use App\Data\Gallery\GalleryCollectionData;
use App\Data\Gallery\GalleryCollectionsData;
use App\Data\Gallery\GalleryData;
use App\Data\Gallery\GalleryNftData;
use App\Enums\ToastType;
use App\Http\Controllers\Concerns\StoresGalleries;
use App\Models\Gallery;
use App\Models\Nft;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyGalleryController extends Controller
{
    use StoresGalleries;

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('Galleries/MyGalleries/Index', [
            'title' => trans('metatags.my_galleries.title'),
            'galleries' => new GalleriesData(GalleryData::collection($user->galleries()->latest()->paginate(12))),
            'nftCount' => $user->nfts->count(),
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $collections = $user
            ->collections()
            ->withUserNftsCount($user)
            ->orderBy('id')
            ->paginate((int) config('dashbrd.gallery.pagination.collections_per_page'));

        $collections->withPath(route('my-galleries.collections'));

        if ($collections->isEmpty()) {
            return redirect(route('my-galleries'));
        }

        $nftsPerPage = (int) config('dashbrd.gallery.pagination.nfts_per_page');

        $nfts = Nft::paginatedCollectionNfts($collections, $user, $nftsPerPage);

        return Inertia::render('Galleries/MyGalleries/Create', [
            'title' => trans('metatags.my_galleries.create.title'),
            'nfts' => GalleryNftData::collection($nfts),
            'collections' => new GalleryCollectionsData(GalleryCollectionData::collection($collections)),
            'nftsPerPage' => $nftsPerPage,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if ($request->get('id') !== null) {
            return $this->updateGallery($request);
        }

        return $this->createGallery($request);
    }

    /**
     * @codeCoverageIgnore
     */
    public function edit(Request $request, Gallery $gallery): Response
    {
        $this->authorize('update', $gallery);

        /** @var User $user */
        $user = $request->user();

        $collections = $user
            ->collections()
            ->withUserNftsCount($user)
            ->orderBy('id')
            ->paginate((int) config('dashbrd.gallery.pagination.collections_per_page'));

        $collections->withPath(route('my-galleries.collections'));

        $nftsPerPage = (int) config('dashbrd.gallery.pagination.nfts_per_page');

        $nfts = Nft::paginatedCollectionNfts($collections, $user, $nftsPerPage);

        return Inertia::render('Galleries/MyGalleries/Create', [
            'title' => trans('metatags.my_galleries.edit.title', ['name' => $gallery->name]),
            'nfts' => GalleryNftData::collection($nfts),
            'collections' => new GalleryCollectionsData(GalleryCollectionData::collection($collections)),
            'gallery' => GalleryData::fromModel(
                gallery: $gallery,
                limit: 16,
            ),
            'nftsPerPage' => $nftsPerPage,
        ]);
    }

    public function destroy(Gallery $gallery): RedirectResponse
    {
        $this->authorize('delete', $gallery);

        $gallery->delete();

        return redirect()
            ->to(route('my-galleries'))
            ->toast(trans('pages.galleries.my_galleries.succesfully_deleted'), ToastType::Success->value);
    }
}
