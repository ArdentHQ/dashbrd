<?php

declare(strict_types=1);

use App\Models\Gallery;

it('can get galleries', function () {
    $user = createUser();

    Gallery::factory()->count(10)->create();

    $response = $this->actingAs($user)
        ->get(route('api-galleries.index'))
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
