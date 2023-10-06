<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Gallery;
use Illuminate\Http\Request;
use Spatie\Browsershot\Browsershot;

class MetaImageController extends Controller
{
    public function __invoke(Request $request, Gallery $gallery)
    {
        Browsershot::url(route('galleries.view', ['gallery' => $gallery->slug]))
            ->windowSize(1480, 768)
            ->waitForFunction("document.querySelectorAll('[data-testid=Skeleton]').length === 0")
            ->setNodeBinary('/Users/alfonsobribiesca/.nvm/versions/node/v18.17.0/bin/node')
            ->setNpmBinary('/Users/alfonsobribiesca/.nvm/versions/node/v18.17.0/bin/npm')
            ->save(storage_path('meta/gallery.png'));

        return [];
    }
}
