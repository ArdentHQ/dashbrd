<?php

declare(strict_types=1);

use App\Data\Nfts\NftCollectionData;
use App\Enums\CurrencyCode;
use App\Models\Gallery;
use App\Models\Nft;
use App\Support\Cache\GalleryCache;
use Illuminate\Support\Facades\Cache;

it('gets the nftsCount from the model', function () {
    $gallery = Gallery::factory()->create();

    $galleryCache = new GalleryCache($gallery);

    expect($galleryCache->nftsCount())->toBe(0);
});

it('gets the nftsCount from cache', function () {
    $gallery = Gallery::factory()->create();

    Cache::shouldReceive('tags')
        ->once()
        ->andReturnSelf()
        ->shouldReceive('rememberForever')
        ->with('gallery_nfts_count-'.$gallery->id, \Closure::class)
        ->once()
        ->andReturn(4);

    $galleryCache = new GalleryCache($gallery);

    expect($galleryCache->nftsCount())->toBe(4);
});

it('clears the nftsCount cache', function () {
    $gallery = Gallery::factory()->create();

    Cache::shouldReceive('tags')
        ->once()
        ->andReturnSelf()
        ->shouldReceive('forget')
        ->with('gallery_nfts_count-'.$gallery->id)
        ->once();

    $galleryCache = new GalleryCache($gallery);

    $galleryCache->clearNftsCount();
});

it('gets the collectionsCount from the model', function () {
    $gallery = Gallery::factory()->create();

    $galleryCache = new GalleryCache($gallery);

    expect($galleryCache->collectionsCount())->toBe(0);
});

it('gets the collectionsCount from cache', function () {
    $gallery = Gallery::factory()->create();

    Cache::shouldReceive('tags')
        ->once()
        ->andReturnSelf()
        ->shouldReceive('rememberForever')
        ->with('gallery_collections_count-'.$gallery->id, \Closure::class)
        ->once()
        ->andReturn(4);

    $galleryCache = new GalleryCache($gallery);

    expect($galleryCache->collectionsCount())->toBe(4);
});

it('clears the collectionsCount cache', function () {
    $gallery = Gallery::factory()->create();

    Cache::shouldReceive('tags')
        ->once()
        ->andReturnSelf()
        ->shouldReceive('forget')
        ->with('gallery_collections_count-'.$gallery->id)
        ->once();

    $galleryCache = new GalleryCache($gallery);

    $galleryCache->clearCollectionsCount();
});

it('gets the collections from the model', function () {
    $gallery = Gallery::factory()->create();

    $galleryCache = new GalleryCache($gallery);

    $nft = Nft::factory()->create();

    $gallery->nfts()->attach($nft, ['order_index' => 0]);

    expect($galleryCache->collections(CurrencyCode::USD)->count())->toBe(1);
});

it('gets the collections from cache', function () {
    $gallery = Gallery::factory()->create();

    $nft = Nft::factory()->create();

    $gallery->nfts()->attach($nft, ['order_index' => 0]);

    Cache::shouldReceive('tags')
        ->once()
        ->andReturnSelf()
        ->shouldReceive('rememberForever')
        ->with('gallery_collections-USD-'.$gallery->id, \Closure::class)
        ->once()
        ->andReturn(NftCollectionData::collection([]));

    $galleryCache = new GalleryCache($gallery);

    expect($galleryCache->collections(CurrencyCode::USD)->count())->toBe(0);
});

it('clears the collections cache', function () {
    $gallery = Gallery::factory()->create();

    $nft = Nft::factory()->create();

    $gallery->nfts()->attach($nft, ['order_index' => 0]);

    $galleryCache = new GalleryCache($gallery);

    expect($galleryCache->collections(CurrencyCode::USD)->count())->toBe(1);

    $nft = Nft::factory()->create();

    $gallery->nfts()->attach($nft, ['order_index' => 0]);

    expect($galleryCache->collections(CurrencyCode::USD)->count())->toBe(1);

    GalleryCache::clearCollections();

    expect($galleryCache->collections(CurrencyCode::USD)->count())->toBe(2);
});

it('clears dirty cache', function () {
    $gallery = Gallery::factory()->create();
    $currency = $gallery->user->currency();

    $nft = Nft::factory()->create();

    $gallery->nfts()->attach($nft, ['order_index' => 0]);

    $galleryCache = new GalleryCache($gallery);

    expect($galleryCache->collections($currency)->count())->toBe(1);

    $nft = Nft::factory()->create();

    $gallery->nfts()->attach($nft, ['order_index' => 0]);

    expect($galleryCache->collections($currency)->count())->toBe(1);

    $this->assertDatabaseCount('galleries_dirty', 1);

    GalleryCache::clearAllDirty();

    $this->assertDatabaseCount('galleries_dirty', 0);

    expect($galleryCache->collections($currency)->count())->toBe(2);
});
