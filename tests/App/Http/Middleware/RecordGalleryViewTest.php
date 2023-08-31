<?php

declare(strict_types=1);

use App\Http\Middleware\RecordGalleryView;
use App\Models\Gallery;
use Illuminate\Support\Facades\Route;

it('updates the views for the gallery page', function () {
    Route::get('/galleries/{gallery}', function (Gallery $gallery) {
        return response('Hello World');
    })->middleware(RecordGalleryView::class);

    $gallery = Gallery::factory()->create();

    expect($gallery->views()->count())->toBe(0);

    $this->get(route('galleries.view', ['gallery' => $gallery]))->assertStatus(200);

    expect($gallery->views()->count())->toBe(1);
});

it('does not update pageviews automatically if cooldown is applied', function () {
    Route::get('/galleries/{gallery}', function (Gallery $gallery) {
        return response('Hello World');
    })->middleware(RecordGalleryView::class);

    $gallery = Gallery::factory()->create();

    expect($gallery->views()->count())->toBe(0);

    $this->get(route('galleries.view', ['gallery' => $gallery]))->assertStatus(200);
    $this->get(route('galleries.view', ['gallery' => $gallery]))->assertStatus(200);
    $this->get(route('galleries.view', ['gallery' => $gallery]))->assertStatus(200);

    expect($gallery->views()->count())->toBe(1);
});

it('applies pageviews if cooldown has passed', function () {
    Route::get('/galleries/{gallery}', function (Gallery $gallery) {
        return response('Hello World');
    })->middleware(RecordGalleryView::class);

    $gallery = Gallery::factory()->create();

    expect($gallery->views()->count())->toBe(0);

    $this->get(route('galleries.view', ['gallery' => $gallery]))->assertStatus(200);

    $this->travel(2)->hours();

    $this->get(route('galleries.view', ['gallery' => $gallery]))->assertStatus(200);
    $this->get(route('galleries.view', ['gallery' => $gallery]))->assertStatus(200);

    expect($gallery->views()->count())->toBe(2);
});

it('does not update views if gallery endpoint is not hit', function () {
    Route::get('/galleries', function () {
        return response(Gallery::first());
    })->middleware(RecordGalleryView::class);

    $gallery = Gallery::factory()->create();

    expect($gallery->views()->count())->toBe(0);

    $this->get('/galleries')->assertStatus(200);

    expect($gallery->views()->count())->toBe(0);
});
