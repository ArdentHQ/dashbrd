<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Gallery;
use Illuminate\Http\Request;
use Spatie\Browsershot\Browsershot;
use Spatie\Image\Image;
use Spatie\Image\Manipulations;

class MetaImageController extends Controller
{
    public function __invoke(Request $request, Gallery $gallery)
    {
        $screenshotPath = $this->takeScreenshot($gallery);

        $path = $this->storeMetaImage($gallery, $screenshotPath);

        return response()->file($path);
    }

    private function takeScreenshot(Gallery $gallery): string
    {
        $tempPath = storage_path('tmp/'.$gallery->slug.'_screenshot.png');

        Browsershot::url(route('galleries.view', ['gallery' => $gallery->slug]))
            ->windowSize(1480, 768)
            ->waitForFunction("document.querySelectorAll('[data-testid=Skeleton]').length === 0")
            ->setNodeBinary('/Users/alfonsobribiesca/.nvm/versions/node/v18.17.0/bin/node')
            ->setNpmBinary('/Users/alfonsobribiesca/.nvm/versions/node/v18.17.0/bin/npm')
            ->save($tempPath);

        $this->resizeScreenshot($tempPath);

        return $tempPath;
    }

    private function resizeScreenshot(string $screenshotPath): void
    {
        Image::load($screenshotPath)
            ->width(1006)
            ->crop(Manipulations::CROP_TOP, 1006, 373)
            ->save($screenshotPath);
    }

    private function storeMetaImage(Gallery $gallery, string $screenshotPath): string
    {
        $imagePath = storage_path('app/public/meta/galleries/'.$gallery->slug.'.png');

        $template = Image::load(resource_path('images/gallery/gallery_template.png'));

        $template
            ->watermark($screenshotPath)
            ->watermarkPosition(Manipulations::POSITION_BOTTOM)
            ->save($imagePath);

        return $imagePath;
    }
}
