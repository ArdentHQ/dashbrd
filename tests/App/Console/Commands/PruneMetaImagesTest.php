<?php

declare(strict_types=1);

use App\Models\Gallery;
use App\Models\Nft;
use Illuminate\Support\Facades\File;

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

it('removes the images that doesnt not belong to any gallery', function () {
    $directory = storage_path(sprintf('meta/galleries/'));

    Gallery::truncate();

    Nft::truncate();

    $gallery = Gallery::factory()->create([
        'name' => 'my gallery',
    ]);
    $gallery->nfts()->attach(Nft::factory()->create(), ['order_index' => 2]);
    $gallery->nfts()->attach(Nft::factory()->create(), ['order_index' => 1]);
    $gallery->nfts()->attach(Nft::factory()->create(), ['order_index' => 3]);

    $gallery2 = Gallery::factory()->create([
        'name' => 'other name of my gallery',
    ]);
    $gallery2->nfts()->attach(Nft::factory()->create(), ['order_index' => 0]);
    $gallery2->nfts()->attach(Nft::factory()->create(), ['order_index' => 1]);

    $gallery3 = Gallery::factory()->create([
        'name' => 'This is another NAME',
    ]);
    $gallery3->nfts()->attach(Nft::factory()->create(), ['order_index' => 0]);

    // for gallery 1
    copy(base_path('tests/fixtures/page-screenshot.png'), storage_path('meta/galleries/my-gallery_dd0f42923f5f46c600b8e7503dd6290b.png'));

    // no image for gallery 2
    // ....

    // for gallery 3
    copy(base_path('tests/fixtures/page-screenshot.png'), storage_path('meta/galleries/this-is-another-name_94bb0c06f620aaf0f3ce27f3df8c1869.png'));

    // similar name to gallery 3 (should be removed)
    copy(base_path('tests/fixtures/page-screenshot.png'), storage_path('meta/galleries/this-is-another-name_differenthash.png'));

    expect(glob($directory.'*'))->toHaveCount(3);

    $this->artisan('prune-meta-images');

    expect(glob($directory.'*'))->toHaveCount(2);
});
