<?php

declare(strict_types=1);

use App\Models\Gallery;

it('can render the galleries dataset pages', function ($page) {
    $user = createUser();

    Gallery::factory()->create();

    $this->actingAs($user)
        ->get(route($page))
        ->assertStatus(200);
})->with([
    'galleries.most-popular',
    'galleries.most-valuable',
    'galleries.newest',
]);

it('can render the galleries dataset pages for live search', function ($page) {
    $user = createUser();

    Gallery::factory()->count(2)->create();

    $response = $this->actingAs($user)
        ->getJson(route($page))
        ->assertStatus(200)
        ->assertJsonStructure(['paginated' => [
            'data',
            'meta',
        ]]);

    expect($response->json('paginated.meta.total'))->toBe(2);
})->with([
    'galleries.most-popular',
    'galleries.most-valuable',
    'galleries.newest',
]);

it('filters the gallery', function ($page) {
    $user = createUser();

    Gallery::factory()->create([
        'name' => 'Test Gallery',
    ]);

    Gallery::factory()->create([
        'name' => 'Example Gallery',
    ]);

    $response = $this->actingAs($user)
        ->getJson(route($page, ['query' => 'Test']))
        ->assertStatus(200)
        ->assertJsonStructure(['paginated' => [
            'data',
            'meta',
        ]]);

    expect($response->json('paginated.meta.total'))->toBe(1);
})->with([
    'galleries.most-popular',
    'galleries.most-valuable',
    'galleries.newest',
]);
