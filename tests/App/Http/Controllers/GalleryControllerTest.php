<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Gallery;
use App\Models\Nft;
use App\Models\Token;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Token::factory()->weth()->create();
});

it('can render the galleries overview page', function () {
    $user = createUser();

    $this->actingAs($user)
        ->get(route('galleries'))
        ->assertStatus(200);
});

it('can render the galleries view page', function () {
    $user = createUser();

    $gallery = Gallery::factory()->create();

    $this->actingAs($user)
        ->get(route('galleries.view', $gallery))
        ->assertStatus(200);
});

it('can get the galleries', function () {
    $user = createUser();

    Gallery::factory()->count(10)->create();

    $response = $this->actingAs($user)
        ->get(route('galleries.galleries'))
        ->assertStatus(200)
        ->json();

    expect(array_keys($response))->toEqual([
        'popular',
        'newest',
        'mostValuable',
    ])
        ->and($response['popular'])->toHaveCount(8)
        ->and($response['newest'])->toHaveCount(8)
        ->and($response['mostValuable'])->toHaveCount(8);

});

it('can render the galleries overview page with the proper counts', function () {
    $user = createUser();

    $gallery = Gallery::factory()->create([
        'user_id' => $user,
    ]);

    $collection1 = Collection::factory()->create();
    $collection2 = Collection::factory()->create();

    for ($i = 0; $i < 3; $i++) {
        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet,
            'collection_id' => $collection1,
        ]);

        $gallery->nfts()->attach($nft, ['order_index' => $i]);

        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet,
            'collection_id' => $collection2,
        ]);

        $gallery->nfts()->attach($nft, ['order_index' => $i]);
    }

    // Add some unassigned models to ensure counts do not include those
    $unusedCollection = Collection::factory()->create();
    for ($i = 0; $i < 3; $i++) {
        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet,
            'collection_id' => $unusedCollection,
        ]);
    }

    $this->actingAs($user)
        ->get(route('galleries'))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Galleries/Index')
                ->where('stats.galleries', 1)
                ->where('stats.collections', 2)
                ->where('stats.nfts', 6)
                ->where('stats.users', 1)
        );
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

it('should increment view count when visiting a gallery', function () {
    $user = createUser();
    $gallery = Gallery::factory()->create();

    expect($gallery->views()->count())->toBe(0);

    $this->actingAs($user)
        ->get(route('galleries.view', $gallery))
        ->assertStatus(200);

    expect($gallery->views()->count())->toBe(1);
});

it('should still throttle increment view count when visiting a gallery', function () {
    $user = createUser();
    $gallery = Gallery::factory()->create();

    expect($gallery->views()->count())->toBe(0);

    $this->actingAs($user)
        ->get(route('galleries.view', $gallery))
        ->assertStatus(200);

    expect($gallery->views()->count())->toBe(1);

    $this->actingAs($user)
        ->get(route('galleries.view', $gallery))
        ->assertStatus(200);

    expect($gallery->views()->count())->toBe(1);

    $this->travel(61)->minutes();

    $this->actingAs($user)
        ->get(route('galleries.view', $gallery))
        ->assertStatus(200);

    expect($gallery->views()->count())->toBe(2);
});

it('can render the galleries overview page with the report available in if not trottled', function () {
    $user = createUser();

    $gallery = Gallery::factory()->create();

    $this->actingAs($user)
        ->get(route('galleries.view', $gallery))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Galleries/View')
                ->where('reportAvailableIn', null)
        );
});

it('can render the galleries overview page with the report available in if trottled', function () {
    $user = createUser();

    $gallery = Gallery::factory()->create();

    // Report the gallery so its trottled
    $this->actingAs($user)
        ->post(route('reports.create', $gallery), [
            'reason' => 'spam',
        ]);

    $this->actingAs($user)
        ->get(route('galleries.view', $gallery))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Galleries/View')
                ->where('reportAvailableIn', trans_choice('common.n_hours', 23, ['count' => 23]))
        );
});
