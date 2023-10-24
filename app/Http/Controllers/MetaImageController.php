<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Gallery;
use Illuminate\Support\Facades\Cache;
use Spatie\Browsershot\Browsershot;
use Spatie\Image\Image;
use Spatie\Image\Manipulations;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MetaImageController extends Controller
{
    public function __invoke(Gallery $gallery): BinaryFileResponse
    {
        $imagePath = $this->getImagePath($gallery);

        $this->generateMetaImage($gallery, $imagePath);

        return response()->file($imagePath);
    }

    private function generateMetaImage(Gallery $gallery, string $imagePath): void
    {
        Cache::lock($gallery->slug.'_meta_image', config('dashbrd.browsershot.timeout') + 15)->get(function () use ($gallery, $imagePath) {
            if ($this->shouldGenerateMetaImage($imagePath)) {
                $screenshotPath = $this->takeScreenshot($gallery);

                $this->storeMetaImage($imagePath, $screenshotPath);
            }
        });
    }

    private function shouldGenerateMetaImage(string $imagePath): bool
    {
        return ! file_exists($imagePath);
    }

    private function getImagePath(Gallery $gallery): string
    {
        return storage_path(sprintf('meta/galleries/%s.png', $this->getImageName($gallery)));
    }

    /**
     * IMPORTANT: Ensure this method is in sync with the query in `queries/gallery.get_meta_images.sql`
     */
    private function getImageName(Gallery $gallery): string
    {
        $parts[] = $gallery->nfts()->orderByPivot('order_index', 'asc')->limit(4)->pluck('id')->join('.');

        $parts[] = $gallery->nfts()->count();

        $parts[] = $gallery->name;

        return $gallery->slug.'_'.md5(implode('_', $parts));
    }

    private function takeScreenshot(Gallery $gallery): string
    {
        $tempPath = storage_path('tmp/'.$gallery->slug.'_screenshot.png');

        app(Browsershot::class)->url(route('galleries.view', ['gallery' => $gallery->slug]))
            ->windowSize(1480, 768)
            ->timeout(config('dashbrd.browsershot.timeout'))
            ->waitForFunction("document.querySelectorAll('[data-testid=GalleryNfts__nft]').length > 0 && Array.from(document.querySelectorAll('[data-testid=GalleryNfts__nft]')).slice(0, 4).every(el => ! el.querySelector('[data-testid=Skeleton]'))")
            ->setNodeBinary(config('dashbrd.browsershot.node_binary'))
            ->setNpmBinary(config('dashbrd.browsershot.npm_binary'))
            ->save($tempPath);

        $this->resizeScreenshot($tempPath);

        return $tempPath;
    }

    private function resizeScreenshot(string $screenshotPath): void
    {
        $image = Image::load($screenshotPath);

        $image->width(1006)->crop(Manipulations::CROP_TOP, 1006, 373);

        $image->save($screenshotPath);
    }

    private function storeMetaImage(string $imagePath, string $screenshotPath): string
    {
        $template = Image::load(resource_path('images/gallery/gallery_template.png'));

        $template
            ->watermark($screenshotPath)
            ->watermarkPosition(Manipulations::POSITION_BOTTOM);

        $template->save($imagePath);

        unlink($screenshotPath);

        return $imagePath;
    }
}
