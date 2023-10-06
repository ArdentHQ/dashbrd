<?php

declare(strict_types=1);

use App\Models\Gallery;
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

function emptyMetaImagesFolder(): void
{
    $metaImagesDir = storage_path('meta/galleries');

    File::deleteDirectory($metaImagesDir);

    File::makeDirectory($metaImagesDir);
}

it('skips image generation if file already exist', function () {
    emptyMetaImagesFolder();

    $gallery = Gallery::factory()->create([
        'name' => 'Test Gallery',
    ]);

    // md5 hash hardcoded here, comes from gallery name and amount and order of nfts (zero in this case)
    copy(base_path('tests/fixtures/page-screenshot.png'), storage_path('meta/galleries/test-gallery_322d55e3faec28077221c1c01b69a30f.png'));

    $this
        ->mock(Browsershot::class)
        ->shouldNotReceive('url');

    $this
        ->get(route('meta-image', ['gallery' => $gallery->slug]))
        ->assertOk();
});

it('generates an image', function () {
    emptyMetaImagesFolder();

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

    $this->get(route('meta-image', ['gallery' => $gallery->slug]))->assertOk();

    $directory = storage_path('meta/galleries/');

    $files = glob($directory.$gallery->slug.'*');

    expect($files)->toHaveCount(1);
});

it('removes any existing image for the same gallery', function () {
    emptyMetaImagesFolder();

    $gallery = Gallery::factory()->create();

    // Pre-existing image
    copy(base_path('tests/fixtures/page-screenshot.png'), storage_path('meta/galleries/'.$gallery->slug.'_test.png'));

    // For other gallery
    copy(base_path('tests/fixtures/page-screenshot.png'), storage_path('meta/galleries/other_slug_test.png'));

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

    $this->get(route('meta-image', ['gallery' => $gallery->slug]))->assertOk();

    $directory = storage_path('meta/galleries/');

    expect(glob($directory.$gallery->slug.'*'))->toHaveCount(1);

    expect(glob($directory.'other_slug_test'.'*'))->toHaveCount(1);

});
