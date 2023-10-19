<?php

declare(strict_types=1);

use App\Models\Gallery;
use App\Models\Nft;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Spatie\Browsershot\Browsershot;

beforeEach(function () {
    $sourceDir = storage_path('meta/galleries');
    $destinationDir = storage_path('tmp/galleries');

    File::copyDirectory($sourceDir, $destinationDir);
});

afterEach(function () {
    $sourceDir = storage_path('tmp/galleries');
    $destinationDir = storage_path('meta/galleries');

    File::copyDirectory($sourceDir, $destinationDir);

    File::deleteDirectory($sourceDir);
});

it('removes deprecated existing images for the gallery when pruning', function () {
    emptyMetaImagesFolder();

    $gallery = Gallery::factory()->create();

    $nft = Nft::factory()->create();

    $gallery->nfts()->attach($nft, ['order_index' => 0]);

    // Pre-existing image
    copy(base_path('tests/fixtures/page-screenshot.png'), storage_path('meta/galleries/'.$gallery->slug.'_test.png'));

    // For other gallery
    copy(base_path('tests/fixtures/page-screenshot.png'), storage_path('meta/galleries/other-slug_test.png'));

    $directory = storage_path('meta/galleries/');

    $this
        ->mock(Browsershot::class)
        ->shouldReceive('url')
        ->with(route('galleries.view', ['gallery' => $gallery->slug]))
        ->once()
        ->andReturnSelf()
        ->shouldReceive('windowSize')
        ->once()
        ->andReturnSelf()
        ->shouldReceive('timeout')
        ->with(60)
        ->once()
        ->andReturnSelf()
        ->shouldReceive('waitForFunction')
        ->once()
        ->andReturnSelf()
        ->shouldReceive('setNodeBinary')
        ->once()
        ->andReturnSelf()
        ->shouldReceive('setNpmBinary')
        ->once()
        ->andReturnSelf()
        // Mock save method implementation
        ->shouldReceive('save')
        ->once()
        ->andReturnUsing(function ($test) {
            // Emulate stored screenshot
            copy(base_path('tests/fixtures/page-screenshot.png'), $test);
        });

    $this->get(route('galleries.meta-image', ['gallery' => $gallery->slug]))->assertOk();

    $directory = storage_path('meta/galleries/');

    expect(glob($directory.'*'))->toHaveCount(3);

    Artisan::call('prune-meta-images');

    expect(glob($directory.'*'))->toHaveCount(1);

    expect(glob($directory.$gallery->slug.'_*'))->toHaveCount(1);
});
