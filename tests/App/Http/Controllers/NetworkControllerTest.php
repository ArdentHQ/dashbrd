<?php

declare(strict_types=1);

it('should return network by chain id', function () {
    $this->actingAs(createUser())
        ->get(route('network-by-chain', ['chainId' => 1]))
        ->assertStatus(200);
});
