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

    emptyMetaImagesFolder();
});

afterEach(function () {
    $sourceDir = storage_path('tmp/galleries');
    $destinationDir = storage_path('meta/galleries');

    File::copyDirectory($sourceDir, $destinationDir);

    File::deleteDirectory($sourceDir);
});

it('skips image generation if file already exist', function () {
    $gallery = Gallery::factory()->create([
        'name' => 'Test Gallery',
    ]);

    // md5 hash hardcoded here, comes from gallery name and amount and order of nfts (zero in this case)
    copy(base_path('tests/fixtures/page-screenshot.png'), storage_path('meta/galleries/test-gallery_2d84f6a1884d56f30d33675aeeaa2aab.png'));

    $this
        ->mock(Browsershot::class)
        ->shouldNotReceive('url');

    $this
        ->get(route('galleries.meta-image', ['gallery' => $gallery->slug]))
        ->assertOk();
});

it('generates an image', function () {
    $gallery = Gallery::factory()->create();

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

    $files = glob($directory.$gallery->slug.'*');

    expect($files)->toHaveCount(1);
});

it('removes deprecated existing images for the gallery when pruning', function () {
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
