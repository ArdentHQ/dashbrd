<?php

declare(strict_types=1);

it('should return wallet data', function () {
    $user = createUser();
    $wallet = $user?->wallet;

    $response = $this->actingAs($user)
        ->getJson(route('wallet'))
        ->assertStatus(200)
        ->json();

    expect($response['wallet']['address'])->toBe($wallet->address);
});
