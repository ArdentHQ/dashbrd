<?php

declare(strict_types=1);

use App\Models\Gallery;
use Illuminate\Support\Facades\Queue;

it('dispatches onto the queue', function () {
    Queue::fake();

    $this->artisan('galleries:update-score');

    Queue::assertClosurePushed(function ($callback) {
        // Verify that closure can be called without errors...
        $closure = $callback->closure;
        $closure();

        return true;
    });
});

it('dispatches a job for all galleries', function () {
    // 10 * 1 = 10
    $galleryWith10Views = Gallery::factory()
        ->afterCreating(fn ($gallery) => addViews($gallery, 10))
        ->create()
        ->fresh();

    // 3 * 10 = 30
    $galleryWith3Likes = Gallery::factory()
        ->hasLikes(3)
        ->create()
        ->fresh();

    // (2*1) + (3*10) = 32
    $galleryWith2ViewsAnd3Likes = Gallery::factory()
        ->afterCreating(fn ($gallery) => addViews($gallery, 2))
        ->hasLikes(3)
        ->create()
        ->fresh();

    // 0
    $galleryWithoutScore = Gallery::factory()->create()->fresh();

    expect($galleryWith10Views->score)->toBe(0);
    expect($galleryWith3Likes->score)->toBe(0);
    expect($galleryWith2ViewsAnd3Likes->score)->toBe(0);
    expect($galleryWithoutScore->score)->toBe(0);

    $this->artisan('galleries:update-score');

    expect($galleryWith10Views->fresh()->score)->toBe(10);
    expect($galleryWith3Likes->fresh()->score)->toBe(30);
    expect($galleryWith2ViewsAnd3Likes->fresh()->score)->toBe(32);
    expect($galleryWithoutScore->fresh()->score)->toBe(0);
});
