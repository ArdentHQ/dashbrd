<?php

declare(strict_types=1);

use App\Models\Gallery;
use App\Support\Facades\Signature;

describe('user is signed', function () {
    beforeEach(function () {
        Signature::shouldReceive('walletIsSigned')
            ->once()
            ->andReturn(true);
    });

    it('can add a like to a gallery', function () {
        $user = createUser();
        $gallery = Gallery::factory()->create();

        expect($gallery->likeCount)->toBe(0);

        $this->actingAs($user)
            ->post(route('galleries.like', $gallery->slug))
            ->assertStatus(201);

        expect($gallery->fresh()->likeCount)->toBe(1);
    });

    it('can force a like to a gallery', function () {
        $user = createUser();
        $gallery = Gallery::factory()->create();

        $gallery->addLike($user);

        expect($gallery->likeCount)->toBe(1);

        $this->actingAs($user)
            ->post(route('galleries.like', ['gallery' => $gallery->slug, 'like' => 1]))
            ->assertStatus(201);

        expect($gallery->fresh()->likeCount)->toBe(1);
    });

    it('can remove a like from a gallery', function () {
        $user = createUser();
        $gallery = Gallery::factory()->create();

        $gallery->addLike($user);

        expect($gallery->likeCount)->toBe(1);

        $this->actingAs($user)
            ->post(route('galleries.like', $gallery->slug))
            ->assertStatus(201);

        expect($gallery->fresh()->likeCount)->toBe(0);
    });

    it('can force remove like to a gallery', function () {
        $user = createUser();
        $gallery = Gallery::factory()->create();

        expect($gallery->likeCount)->toBe(0);

        $this->actingAs($user)
            ->post(route('galleries.like', ['gallery' => $gallery->slug, 'like' => 0]))
            ->assertStatus(201);

        expect($gallery->fresh()->likeCount)->toBe(0);
    });
});

describe('user is not signed', function () {
    beforeEach(function () {
        Signature::shouldReceive('walletIsSigned')
            ->once()
            ->andReturn(false);
    });

    it('cant add a like to a gallery', function () {
        $user = createUser();
        $gallery = Gallery::factory()->create();

        expect($gallery->likeCount)->toBe(0);

        $this->actingAs($user)
            ->post(route('galleries.like', $gallery->slug))
            ->assertRedirect();

        expect($gallery->fresh()->likeCount)->toBe(0);
    });

    it('cant remove a like from a gallery', function () {
        $user = createUser();
        $gallery = Gallery::factory()->create();

        $gallery->addLike($user);

        expect($gallery->likeCount)->toBe(1);

        $this->actingAs($user)
            ->post(route('galleries.like', $gallery->slug))
            ->assertRedirect();

        expect($gallery->fresh()->likeCount)->toBe(1);
    });
});
