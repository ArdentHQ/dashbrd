<?php

declare(strict_types=1);

use App\Models\Gallery;

it('can render the galleries dataset pages', function ($filter) {
    $user = createUser();

    Gallery::factory()->create();

    $this->actingAs($user)
        ->get(route('filtered-galleries.index', [
            'filter' => $filter,
        ]))
        ->assertStatus(200);
})->with([
    'most-popular',
    'most-valuable',
    'newest',
]);

it('can render the galleries dataset pages for live search', function ($filter) {
    $user = createUser();

    Gallery::factory()->count(2)->create();

    $response = $this->actingAs($user)
        ->getJson(route('filtered-galleries.index', [
            'filter' => $filter,
        ]))
        ->assertStatus(200)
        ->assertJsonStructure(['paginated' => [
            'data',
            'meta',
        ]]);

    expect($response->json('paginated.meta.total'))->toBe(2);
})->with([
    'most-popular',
    'most-valuable',
    'newest',
]);

it('filters the gallery', function ($filter) {
    $user = createUser();

    Gallery::factory()->create([
        'name' => 'Test Gallery',
    ]);

    Gallery::factory()->create([
        'name' => 'Example Gallery',
    ]);

    $response = $this->actingAs($user)
        ->getJson(route('filtered-galleries.index', [
            'filter' => $filter,
            'query' => 'Test',
        ]))
        ->assertStatus(200)
        ->assertJsonStructure(['paginated' => [
            'data',
            'meta',
        ]]);

    expect($response->json('paginated.meta.total'))->toBe(1);
})->with([
    'most-popular',
    'most-valuable',
    'newest',
]);
