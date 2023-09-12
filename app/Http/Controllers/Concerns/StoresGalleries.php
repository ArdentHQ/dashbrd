<?php

declare(strict_types=1);

namespace App\Http\Controllers\Concerns;

use Illuminate\Filesystem\FilesystemAdapter;
use App\Enums\ToastType;
use App\Models\Gallery;
use App\Models\User;
use App\Support\Cache\GalleryCache;
use App\Support\Cache\UserCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

trait StoresGalleries
{
    protected function createGallery(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $this->validateStoreGalleryRequest($request, $user);

        $coverImage = $this->getCoverImage($data['coverImage']);

        $gallery = $user->galleries()->create([
            'name' => $data['name'],
            'cover_image' => $coverImage,
        ]);

        $this->syncNfts($gallery, $data['nfts']);

        Gallery::updateValues([$gallery->id]);

        UserCache::from($user)->clearGalleriesCount();

        return redirect()->to(route('galleries.view', $gallery))->toast(trans('pages.galleries.my_galleries.successfully_created'), ToastType::Success->value);
    }

    protected function updateGallery(Request $request): RedirectResponse
    {
        $user = $request->user();

        $gallery = $user->galleries()
            ->findOrFail($request->get('id'));

        $rules = [];
        if (is_string($request->get('coverImage'))) {
            $rules = [
                'coverImage' => [
                    Rule::in($gallery->cover_image),
                ],
            ];
        }

        $data = $this->validateStoreGalleryRequest($request, $user, $rules);

        $coverImage = $this->getCoverImage($data['coverImage']);

        $gallery->fill([
            'name' => $data['name'],
            'cover_image' => $coverImage,
        ])->save();

        $this->syncNfts($gallery, $data['nfts'], true);

        Gallery::updateValues([$gallery->id]);

        (new GalleryCache($gallery))->clearAll();

        return redirect()->to(route('galleries.view', $gallery))->toast(trans('pages.galleries.my_galleries.successfully_updated'), ToastType::Success->value);
    }

    /**
     * Sync NFTs with Gallery
     *
     * @param  array<int, int>  $nfts
     */
    private function syncNfts(Gallery $gallery, array $nfts, bool $clearOld = false): void
    {
        if ($clearOld) {
            $gallery->nfts()->sync([]);
        }

        foreach ($nfts as $index => $nftId) {
            $gallery->nfts()->attach($nftId, ['order_index' => $index]);
        }
    }

    private function getCoverImage(null|UploadedFile|string $coverImage): ?string
    {
        if (is_string($coverImage)) {
            return $coverImage;
        }

        if ($coverImage !== null && is_a($coverImage, UploadedFile::class)) {
            /** @var FilesystemAdapter $disk */
            $disk = Storage::disk('public');
            $filePath = $disk->put('galleryCoverImages', $coverImage);
            if ($filePath === false) {
                return null;
            }

            /** @var string $filePath */
            return Storage::url($filePath);
        }

        return null;
    }

    /**
     * Validate Gallery request data
     *
     * @param  array<string, array<mixed>>  $rules
     * @return array<string, mixed>
     */
    private function validateStoreGalleryRequest(Request $request, User $user, array $rules = []): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'nfts' => ['required', 'array', 'max:'.config('dashbrd.gallery.nft_limit')],
            'nfts.*' => [
                'required',
                // Check all user wallets as they can exist on different networks
                Rule::exists('nfts', 'id')->whereIn('wallet_id', $user->wallets->map(fn ($wallet) => $wallet->id)),
            ],
            'coverImage' => [
                'nullable',
                File::types(['png', 'gif', 'jpg'])
                    ->max(2048),
            ],
            ...$rules,
        ], [
            'name.required' => trans('validation.gallery_title_required'),
            'name.max' => trans('validation.gallery_title_max_characters'),
            'name' => trans('validation.gallery_title_invalid'),
            'nfts.required' => trans('validation.nfts_required'),
            'nfts.max' => trans('validation.nfts_max_size', ['limit' => config('dashbrd.gallery.nft_limit')]),
            'nfts.*' => trans('validation.invalid_nfts'),
            'coverImage' => trans('validation.invalid_cover'),
        ]);
    }
}
